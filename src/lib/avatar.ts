import { isNative } from "@/lib/native/platform";
import {
  notifyPermissionBlocked,
  requestPermission,
  type PermissionKey,
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
 * Camera + gallery are only requested at the moment a photo is picked. If the
 * OS has permanently denied one, the settings dialog is surfaced instead of a
 * silent failure — the app itself keeps working either way.
 */
export async function ensurePhotoAccess(): Promise<boolean> {
  if (!isNative()) return true;
  const camera = await requestPermission("camera");
  const photos = await requestPermission("photos");
  if (camera === "granted" || photos === "granted" || camera === "unsupported") return true;
  const blocked: PermissionKey | null =
    camera === "blocked" ? "camera" : photos === "blocked" ? "photos" : null;
  if (blocked) notifyPermissionBlocked(blocked);
  return false;
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
    if (!(await ensurePhotoAccess())) return null;
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
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
    if (!(await ensurePhotoAccess())) return null;
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 92,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
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