import { CloudOff, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { t } = useTranslation();
  const { online, pending } = useNetworkStatus();

  if (online && pending === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-rise mx-5 mt-3 flex items-center gap-3 rounded-2xl bg-sky px-4 py-2.5 text-sm text-on-tint"
    >
      {online ? (
        <RefreshCw className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <CloudOff className="size-4 shrink-0" aria-hidden />
      )}
      <p>{online ? t("offlineBanner.syncing", { count: pending }) : t("offlineBanner.offline")}</p>
    </div>
  );
}
