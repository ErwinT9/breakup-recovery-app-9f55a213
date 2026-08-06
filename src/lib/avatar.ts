import { isNative } from "@/lib/native/platform";
import { toast } from "sonner";

import { requestImageSource, type ImageSource } from "@/lib/native/imageSource";
import {
  PERMISSION_COPY,
  notifyPermissionBlocked,
  requestPermission,
} from "@/lib/native/permissions";

/**
 * Profile photo handling.
 *
 * The picked image is downscaled to a square 256px JPEG data URL before it is
 * written to `profiles.avatar_url`. That keeps the avatar tiny (~15–25 KB),
 * available offline, and avoids signed-URL expiry for a value that is rendered
 * on nearly every screen.
 */

const MAX_SIZE = 256;
const QUALITY = 0.82;

/**
 * Gate for one specific source, checked at the moment the user picks it:
 *  - camera  → verify CAMERA, request it if the OS can still prompt, and never
 *              launch the camera when it ends up denied.
 *  - gallery → system photo picker, so no runtime permission is requested.
 *
 * A plain denial gets a friendly explanation; a permanent denial ("Don't ask
 * again") opens the settings dialog. Either way the rest of the app keeps
 * working.
 */
export async function ensureImageSourceAccess(source: ImageSource): Promise<boolean> {
  if (!isNative() || source === "gallery") return true;
  const state = await requestPermission("camera");
  if (state === "granted" || state === "unsupported") return true;
  if (state === "blocked") {
    notifyPermissionBlocked("camera");
  } else {
    toast.error(PERMISSION_COPY.camera.title, { description: PERMISSION_COPY.camera.why });
  }
  return false;
}

/** Asks which source to use, then gates it. Returns null when cancelled/denied. */
async function chooseAllowedSource(): Promise<ImageSource | null> {
  const source = await requestImageSource();
  if (!source) return null;
  return (await ensureImageSourceAccess(source)) ? source : null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image"));
    image.src = src;
  });
}

/** Center-crops to a square and downscales to a compact JPEG data URL. */
export async function toAvatarDataUrl(source: string): Promise<string> {
  const image = await loadImage(source);
  const side = Math.min(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = MAX_SIZE;
  canvas.height = MAX_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(
    image,
    (image.width - side) / 2,
    (image.height - side) / 2,
    side,
    side,
    0,
    0,
    MAX_SIZE,
    MAX_SIZE,
  );
  return canvas.toDataURL("image/jpeg", QUALITY);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Opens the native photo picker on Android/iOS and the file picker on web.
 * Resolves to `null` when the user cancels.
 */
export async function pickAvatar(): Promise<string | null> {
  if (isNative()) {
    const source = await chooseAllowedSource();
    if (!source) return null;
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
        width: 512,
        height: 512,
      });
      if (!photo.dataUrl) return null;
      return toAvatarDataUrl(photo.dataUrl);
    } catch {
      return null; // user cancelled the native picker
    }
  }

  const file = await new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
  if (!file) return null;
  return toAvatarDataUrl(await readFile(file));
}

/**
 * Picks a photo and returns the ORIGINAL data URL (no crop, no downscale) so
 * the in-app cropper can work with full detail. Resolves to `null` on cancel.
 */
export async function pickImageSource(): Promise<string | null> {
  if (isNative()) {
    const source = await chooseAllowedSource();
    if (!source) return null;
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 92,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
      });
      return photo.dataUrl ?? null;
    } catch {
      return null; // user cancelled the native picker
    }
  }

  const file = await new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
  if (!file) return null;
  return readFile(file);
}