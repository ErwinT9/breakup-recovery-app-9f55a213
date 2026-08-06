import { Bell, Camera as CameraIcon, Images, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isNative } from "@/lib/native/platform";
import {
  PERMISSION_COPY,
  PERMISSION_ONBOARDED_KEY,
  checkPermission,
  openAppSettings,
  requestPermission,
  setPermissionBlockedHandler,
  type PermissionKey,
} from "@/lib/native/permissions";
import { storage } from "@/lib/native/storage";

const ICONS: Record<PermissionKey, typeof Bell> = {
  notifications: Bell,
  camera: CameraIcon,
  photos: Images,
};

/** Asked one at a time on the very first launch — never again after that. */
const ONBOARDING_ORDER: PermissionKey[] = ["notifications", "camera", "photos"];

/**
 * Owns the two pieces of permission UI:
 *  - the first-launch sequence (one friendly explainer per permission)
 *  - the "permanently denied" dialog with a shortcut to system settings
 */
export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<PermissionKey[]>([]);
  const [blocked, setBlocked] = useState<PermissionKey | null>(null);

  useEffect(() => {
    setPermissionBlockedHandler((key) => setBlocked(key));
    return () => setPermissionBlockedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isNative()) return;
      if (await storage.get<boolean>(PERMISSION_ONBOARDED_KEY, false)) return;
      const pending: PermissionKey[] = [];
      for (const key of ONBOARDING_ORDER) {
        // Only ask for what the OS can still prompt for.
        if ((await checkPermission(key)) === "prompt") pending.push(key);
      }
      await storage.set(PERMISSION_ONBOARDED_KEY, true);
      if (!cancelled && pending.length > 0) setQueue(pending);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = queue[0] ?? null;
  const advance = () => setQueue((rest) => rest.slice(1));

  const allow = async () => {
    if (!current) return;
    await requestPermission(current);
    advance();
  };

  return (
    <>
      {children}

      {/* First-launch explainer, one permission at a time */}
      <Dialog open={Boolean(current)} onOpenChange={(open) => (!open ? advance() : undefined)}>
        <DialogContent className="max-w-sm rounded-3xl">
          {current ? <Explainer permission={current} /> : null}
          <DialogFooter className="mt-2 flex-row gap-2 sm:justify-end">
            <Button variant="ghost" className="flex-1 rounded-full" onClick={advance}>
              Not now
            </Button>
            <Button className="flex-1 rounded-full" onClick={() => void allow()}>
              Allow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanently denied — offer system settings */}
      <Dialog open={Boolean(blocked)} onOpenChange={(open) => (!open ? setBlocked(null) : undefined)}>
        <DialogContent className="max-w-sm rounded-3xl">
          {blocked ? (
            <>
              <Explainer permission={blocked} blocked />
              <DialogFooter className="mt-2 flex-row gap-2 sm:justify-end">
                <Button variant="ghost" className="flex-1 rounded-full" onClick={() => setBlocked(null)}>
                  Not now
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  onClick={() => {
                    setBlocked(null);
                    void openAppSettings();
                  }}
                >
                  <Settings2 className="mr-2 size-4" />
                  Open settings
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Explainer({ permission, blocked }: { permission: PermissionKey; blocked?: boolean }) {
  const copy = PERMISSION_COPY[permission];
  const Icon = ICONS[permission];
  return (
    <DialogHeader className="items-center text-center">
      <span className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" />
      </span>
      <DialogTitle>
        {blocked ? `${copy.title} is turned off` : `Allow ${copy.title.toLowerCase()}?`}
      </DialogTitle>
      <DialogDescription className="text-balance">
        {blocked ? `${copy.why} ${copy.settingsHint}` : copy.why}
      </DialogDescription>
    </DialogHeader>
  );
}
