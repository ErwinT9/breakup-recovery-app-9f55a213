import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  FileText,
  Info,
  LogOut,
  RefreshCw,
  ScrollText,
  Settings,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { clearUserCache, profileRepo, streakRepo } from "@/data/repository";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { humanizeError } from "@/lib/analytics";
import { haptic } from "@/lib/native/haptics";
import { shareApp } from "@/lib/share";
import { toastOnce } from "@/lib/toastOnce";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.0";

export function MoreDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { restore, busy } = useSubscription();
  const [resetOpen, setResetOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 16));

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileRepo.get(userId),
    enabled: Boolean(userId),
  });

  const applyDate = useMutation({
    mutationFn: async (iso: string) => {
      const current = await streakRepo.ensure(userId, iso);
      return streakRepo.save(userId, {
        ...current,
        started_at: iso,
        relapse_count: current.relapse_count + 1,
      });
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["streak", userId], next);
      toastOnce("reset-date", t("reset.done"), "success");
      setDateOpen(false);
      onOpenChange(false);
    },
    onError: () => toastOnce("reset-date-error", t("reset.failed"), "error"),
  });

  const name = profile.data?.display_name ?? user?.email?.split("@")[0] ?? "Friend";

  const logOut = async () => {
    haptic.light();
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await clearUserCache(userId);
      await signOut();
      toastOnce("logged-out", t("toast.loggedOut"), "success");
      void navigate({ to: "/auth", replace: true });
    } catch (error) {
      toastOnce("logout-error", humanizeError(error), "error");
    }
  };

  const items = [
    {
      icon: CalendarClock,
      label: t("drawer.resetDate"),
      onClick: () => setResetOpen(true),
    },
    {
      icon: Share2,
      label: t("drawer.invite"),
      onClick: () => void shareApp(),
    },
    {
      icon: FileText,
      label: t("drawer.privacy"),
      onClick: () => void navigate({ to: "/privacy" }),
    },
    {
      icon: ScrollText,
      label: t("drawer.terms"),
      onClick: () => void navigate({ to: "/terms" }),
    },
    { icon: Info, label: t("drawer.about"), onClick: () => setAboutOpen(true) },
    {
      icon: RefreshCw,
      label: t("drawer.restore"),
      onClick: () => {
        if (!busy) void restore();
      },
    },
    {
      icon: LogOut,
      label: t("common.logOut"),
      onClick: () => setLogoutOpen(true),
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[86%] max-w-xs border-r border-border bg-background p-0"
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {profile.data?.avatar_url ? (
                  <AvatarImage src={profile.data.avatar_url} alt={name} />
                ) : null}
                <AvatarFallback className="bg-mint text-on-tint">
                  {name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{name}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label={t("common.settings")}
              onClick={() => {
                haptic.select();
                onOpenChange(false);
                void navigate({ to: "/profile" });
              }}
              className="press mt-1 flex size-10 items-center justify-center rounded-full bg-muted text-foreground"
            >
              <Settings className="size-5" aria-hidden />
            </button>
          </div>

          <nav className="mt-6 px-3 pb-6">
            {items.map(({ icon: Icon, label, onClick }, index) => (
              <div key={label}>
                {index > 0 ? <div className="mx-4 h-px bg-border" /> : null}
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    onClick();
                  }}
                  className={cn(
                    "press flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left",
                    "transition-colors hover:bg-muted active:bg-muted",
                  )}
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reset.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("reset.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="rounded-2xl" onClick={() => setDateOpen(true)}>
              {t("reset.action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dateOpen} onOpenChange={setDateOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("reset.pickNew")}</DialogTitle>
          </DialogHeader>
          <Label htmlFor="reset-date">{t("reset.since")}</Label>
          <Input
            id="reset-date"
            type="datetime-local"
            value={newDate}
            max={new Date().toISOString().slice(0, 16)}
            onChange={(event) => setNewDate(event.target.value)}
            className="h-12 rounded-2xl"
          />
          <Button
            className="press h-12 w-full rounded-2xl"
            disabled={applyDate.isPending}
            onClick={() => applyDate.mutate(new Date(newDate).toISOString())}
          >
            {t("reset.saveNewDate")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("drawer.about")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">{t("drawer.version")}</span> · {APP_VERSION}
            </p>
            <p>
              <span className="text-muted-foreground">{t("drawer.developer")}</span> · No Contact
              Labs
            </p>
            <p>
              <span className="text-muted-foreground">Open-source libraries</span> · React,
              TanStack Router &amp; Query, Capacitor, Supabase JS, Radix UI, Tailwind CSS,
              lucide-react, canvas-confetti.
            </p>
            <p className="text-muted-foreground">{t("drawer.privacyNote")}</p>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.logOut")}</AlertDialogTitle>
            <AlertDialogDescription>{t("common.logOutQuestion")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">{t("common.cancel")}</AlertDialogCancel>
            <Button className="rounded-2xl" onClick={() => void logOut()}>
              {t("common.logOut")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
