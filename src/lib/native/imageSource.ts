/**
 * Promise-based "Camera or Gallery?" chooser.
 *
 * Asking first lets us request ONLY the permission the chosen source needs:
 * the camera path needs CAMERA, the gallery path uses the Android Photo Picker
 * (Android 13+) / plugin-managed picker, which grants temporary access without
 * any storage or media runtime permission.
 */
export type ImageSource = "camera" | "gallery";

type Chooser = (resolve: (source: ImageSource | null) => void) => void;

let chooser: Chooser | null = null;

export function setImageSourceChooser(handler: Chooser | null): void {
  chooser = handler;
}

export function requestImageSource(): Promise<ImageSource | null> {
  if (!chooser) return Promise.resolve("gallery");
  return new Promise((resolve) => chooser?.(resolve));
}
