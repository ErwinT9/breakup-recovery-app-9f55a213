import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Cloud,
  Crown,
  Download,
  Globe,
  Image as ImageIcon,
  Moon,
  RefreshCw,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { SoftCard } from "@/components/SoftCard";
import { AvatarCropper } from "@/components/AvatarCropper";
import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/lib/theme";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { clearUserCache, profileRepo, streakRepo } from "@/data/repository";
import { useAuth } from "@/hooks/useAuth";
import { activity } from "@/lib/badgeActivity";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { analytics, humanizeError } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { pickImageSource } from "@/lib/avatar";
import { LANGUAGES, setLanguage, type LanguageCode } from "@/lib/i18n";
import { haptic } from "@/lib/native/haptics";
import { storage } from "@/lib/native/storage";
import { toastOnce } from "@/lib/toastOnce";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_CATEGORIES,
  loadNotificationPrefs,
  requestNotificationPermission,
  saveNotificationPrefs,
  syncReminders,
  type NotificationPrefs,
} from "@/lib/notifications";
import { flushQueue } from "@/lib/offline/syncQueue";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Settings | No Contact Tracker" },
      {
        name: "description",
        content: "Manage your profile, reminders, language, backup and account.",
      },
      { property: "og:title", content: "Settings | No Contact Tracker" },
      { property: "og:description", content: "Your account, reminders and privacy settings." },
    ],
  }),
  component: SettingsScreen,
});

type NotifPrefs = NotificationPrefs;
const DEFAULT_NOTIFS: NotifPrefs = DEFAULT_NOTIFICATION_PREFS;

function Row({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-5 text-muted-foreground" aria-hidden />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { online, pending } = useNetworkStatus();
  const { isPremium } = useSubscription();
  const theme = useTheme();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [recovery, setRecovery] = useState("");
  const [notifs, setNotifs] = useState<NotifPrefs>(DEFAULT_NOTIFS);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [finalOpen, setFinalOpen] = useState(false);
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [deleting, setDeleting] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);

  useEffect(() => {
    analytics.screen("settings");
    void loadNotificationPrefs().then(setNotifs);
    void storage.get<string | null>("nc:last-sync", null).then(setLastSync);
  }, []);

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileRepo.get(userId),
    enabled: Boolean(userId),
  });
  const streak = useQuery({
    queryKey: ["streak", userId],
    queryFn: () => streakRepo.get(userId),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!profile.data) return;
    setName(profile.data.display_name ?? "");
    setBio(profile.data.bio ?? "");
    setAvatar(profile.data.avatar_url ?? "");
  }, [profile.data]);

  useEffect(() => {
    if (streak.data?.started_at) setRecovery(streak.data.started_at.slice(0, 16));
  }, [streak.data?.started_at]);

  const update = useMutation({
    mutationFn: async (patch: Parameters<typeof profileRepo.update>[1]) =>
      profileRepo.update(userId, patch),
    onSuccess: (next) => {
      queryClient.setQueryData(["profile", userId], next);
      if (next.display_name) activity.profileSetupDone();
    },
    onError: (error) => toast.error(humanizeError(error)),
  });

  const saveNotifs = async (patch: Partial<NotifPrefs>) => {
    const next = { ...notifs, ...patch };
    setNotifs(next);
    haptic.select();
    await saveNotificationPrefs(next);
    await syncReminders({
      enabled: profile.data?.notifications_enabled ?? false,
      morning: profile.data?.morning_reminder ?? true,
      evening: profile.data?.evening_reminder ?? true,
      categories: next,
    });
  };

  const toggleReminders = async (enabled: boolean) => {
    haptic.select();
    const granted = enabled ? await requestNotificationPermission() : false;
    await update.mutateAsync({ notifications_enabled: enabled && granted });
    await syncReminders({
      enabled: enabled && granted,
      morning: profile.data?.morning_reminder ?? true,
      evening: profile.data?.evening_reminder ?? true,
      categories: notifs,
    });
    if (enabled && !granted) toast("Enable notifications in your phone settings to get reminders.");
  };

  const saveProfile = async () => {
    haptic.light();
    await update.mutateAsync({
      display_name: name.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatar.trim() || null,
    });
    if (recovery && streak.data) {
      const next = await streakRepo.setStart(
        userId,
        streak.data,
        new Date(recovery).toISOString(),
      );
      queryClient.setQueryData(["streak", userId], next);
    }
    toastOnce("profile-saved", t("toast.saved"), "success");
  };

  const choosePhoto = async () => {
    haptic.light();
    setPhotoBusy(true);
    try {
      const source = await pickImageSource();
      if (!source) return;
      setCropSource(source);
    } catch {
      toastOnce("avatar-failed", t("toast.photoFailed"), "error");
    } finally {
      setPhotoBusy(false);
    }
  };

  /** Persists the cropped square image and refreshes every avatar in the app. */
  const saveCroppedPhoto = async (dataUrl: string) => {
    setPhotoBusy(true);
    try {
      setAvatar(dataUrl);
      await update.mutateAsync({ avatar_url: dataUrl });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setCropSource(null);
      toastOnce("avatar-updated", t("toast.photoUpdated"), "success");
    } catch {
      toastOnce("avatar-failed", t("toast.photoFailed"), "error");
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    haptic.light();
    setAvatar("");
    await update.mutateAsync({ avatar_url: null });
    await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    toastOnce("avatar-removed", t("toast.photoRemoved"), "success");
  };

  const syncNow = async () => {
    haptic.light();
    await flushQueue();
    const stamp = new Date().toISOString();
    await storage.set("nc:last-sync", stamp);
    setLastSync(stamp);
    toastOnce("backup-complete", t("toast.backupComplete"), "success");
  };

  const exportData = async () => {
    haptic.light();
    const payload = {
      exported_at: new Date().toISOString(),
      profile: profile.data,
      streak: streak.data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "no-contact-tracker-data.json";
    link.click();
    URL.revokeObjectURL(url);
    toastOnce("exported", t("toast.exported"), "success");
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      await clearUserCache(userId);
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOut();
      await clearAllLocalData();
      setFinalOpen(false);
      setDeleteOpen(false);
      setCountdown(5);
      setDeletedOpen(true);
    } catch (error) {
      toast.error(humanizeError(error));
    } finally {
      setDeleting(false);
      setConfirmText("");
    }
  };

  useEffect(() => {
    if (!deletedOpen) return;
    const timer = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          void navigate({ to: "/auth", replace: true });
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deletedOpen, navigate]);

  return (
    <div className="animate-in slide-in-from-right-6 fade-in mx-auto flex min-h-screen w-full max-w-md flex-col duration-300">
      <header className="rounded-b-[2rem] bg-muted/60 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-6">
        <button
          type="button"
          aria-label="Back"
          onClick={() => {
            haptic.light();
            router.history.back();
          }}
          className="press flex size-10 items-center justify-center rounded-full bg-background"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <h1 className="mt-4 text-[2rem] font-semibold tracking-tight">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </header>

      <main className="flex-1 space-y-4 px-5 py-5">
        <SoftCard className="space-y-4">
          <Row
            icon={UserRound}
            title={t("settings.editProfile")}
            description={t("settings.editProfileDesc")}
          />
          <div className="flex items-center gap-4">
            <UserAvatar
              src={avatar || null}
              name={name}
              alt={t("settings.profilePhoto")}
              className="size-16 text-xl"
            />
            <div className="flex-1 space-y-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="size-4" aria-hidden /> {t("settings.profilePhoto")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="press h-10 rounded-2xl"
                  disabled={photoBusy}
                  onClick={() => void choosePhoto()}
                >
                  <Upload className="size-4" aria-hidden />
                  {avatar ? t("common.change") : t("common.upload")}
                </Button>
                {avatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="press h-10 rounded-2xl text-destructive"
                    disabled={photoBusy}
                    onClick={() => void removePhoto()}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {t("common.remove")}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.photoHint")}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="display-name">{t("settings.displayName")}</Label>
            <Input
              id="display-name"
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">{t("settings.bio")}</Label>
            <Textarea
              id="bio"
              maxLength={200}
              rows={3}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="rounded-2xl"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="recovery-date" className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden /> {t("settings.recoveryStart")}
            </Label>
            <Input
              id="recovery-date"
              type="datetime-local"
              value={recovery}
              max={new Date().toISOString().slice(0, 16)}
              onChange={(event) => setRecovery(event.target.value)}
              className="h-12 rounded-2xl"
            />
          </div>
          <Button
            className="press h-12 w-full rounded-2xl"
            disabled={update.isPending}
            onClick={() => void saveProfile()}
          >
            {t("settings.saveChanges")}
          </Button>
        </SoftCard>

        <SoftCard className="space-y-4">
          <Row
            icon={Bell}
            title={t("settings.notifications")}
            description={t("settings.notificationsDesc")}
          >
            <Switch
              checked={profile.data?.notifications_enabled ?? false}
              onCheckedChange={(checked) => void toggleReminders(checked)}
              aria-label={t("settings.notifications")}
            />
          </Row>
          {profile.data?.notifications_enabled ? (
            <div className="space-y-3">
              {NOTIFICATION_CATEGORIES.filter(
                ({ key }) => key !== "morning" && key !== "evening",
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={notifs[key]}
                    onCheckedChange={(checked) => void saveNotifs({ [key]: checked })}
                    aria-label={label}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm">Morning reminder (9:00)</span>
                <Switch
                  checked={profile.data?.morning_reminder ?? true}
                  onCheckedChange={(checked) => {
                    void update.mutateAsync({ morning_reminder: checked }).then(() =>
                      syncReminders({
                        enabled: true,
                        morning: checked,
                        evening: profile.data?.evening_reminder ?? true,
                      }),
                    );
                  }}
                  aria-label="Morning reminder"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Evening reminder (20:00)</span>
                <Switch
                  checked={profile.data?.evening_reminder ?? true}
                  onCheckedChange={(checked) => {
                    void update.mutateAsync({ evening_reminder: checked }).then(() =>
                      syncReminders({
                        enabled: true,
                        morning: profile.data?.morning_reminder ?? true,
                        evening: checked,
                      }),
                    );
                  }}
                  aria-label="Evening reminder"
                />
              </div>
            </div>
          ) : null}
        </SoftCard>

        <SoftCard className="space-y-3">
          <Row
            icon={Globe}
            title={t("settings.language")}
            description={t("settings.languageDesc")}
          />
        </SoftCard>

        <SoftCard className="space-y-3">
          <Row
            icon={Moon}
            title={t("settings.appearance")}
            description={t("settings.appearanceDesc")}
          />
          <Select value={theme.mode} onValueChange={(value) => theme.setMode(value as ThemeMode)}>
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t("settings.themeLight")}</SelectItem>
              <SelectItem value="dark">{t("settings.themeDark")}</SelectItem>
              <SelectItem value="system">{t("settings.themeSystem")}</SelectItem>
            </SelectContent>
          </Select>
        </SoftCard>

        <SoftCard className="space-y-3">
          <Row
            icon={Globe}
            title={t("settings.language")}
            description={t("settings.languageDesc")}
          />
          <Select
            value={i18n.language as LanguageCode}
            onValueChange={(value) => {
              void setLanguage(value as LanguageCode);
              toastOnce("language-saved", t("toast.languageSaved"), "success");
            }}
          >
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {LANGUAGES.map((entry) => (
                <SelectItem key={entry.code} value={entry.code}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SoftCard>

        <SoftCard className="space-y-3">
          <Row icon={Download} title="Export my data" description="Download a copy as JSON." />
          <Button
            variant="secondary"
            className="press h-11 w-full rounded-2xl"
            onClick={() => void exportData()}
          >
            Export
          </Button>
        </SoftCard>

        <SoftCard className="space-y-3">
          <Row
            icon={Cloud}
            title="Backup & sync"
            description={online ? "Connected" : "Offline mode — changes save on this device"}
          />
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Status: {online ? (pending > 0 ? "Syncing" : "Up to date") : "Waiting for network"}</li>
            <li>Pending uploads: {pending}</li>
            <li>Last sync: {lastSync ? new Date(lastSync).toLocaleString() : "Not yet"}</li>
          </ul>
          <Button
            variant="secondary"
            className="press h-11 w-full rounded-2xl"
            onClick={() => void syncNow()}
          >
            <RefreshCw className="size-4" aria-hidden />
            Sync now
          </Button>
        </SoftCard>

        {!isPremium ? (
          <Link to="/paywall" className="press block">
            <SoftCard className="bg-lavender flex items-center gap-3">
              <Crown className="size-5 text-on-tint" aria-hidden />
              <div className="flex-1">
                <p className="font-medium text-on-tint">Go Premium</p>
                <p className="text-sm text-on-tint/75">7 days free, then unlock everything.</p>
              </div>
            </SoftCard>
          </Link>
        ) : (
          <SoftCard className="bg-lavender flex items-center gap-3">
            <Crown className="size-5 text-on-tint" aria-hidden />
            <p className="font-medium text-on-tint">Premium active</p>
          </SoftCard>
        )}

        <Button
          variant="ghost"
          className="press h-12 w-full rounded-2xl text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden />
          Delete account
        </Button>
      </main>

      <AvatarCropper
        open={Boolean(cropSource)}
        source={cropSource}
        busy={photoBusy}
        onCancel={() => setCropSource(null)}
        onCropped={saveCroppedPhoto}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              All of your cloud data — streak, flags, wins, badges and letters — will be deleted
              permanently. Confirm with your password to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            value={password}
            placeholder="Your password"
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl"
            aria-label="Password"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className="rounded-2xl"
              disabled={deleting || password.length < 6}
              onClick={() => void deleteAccount()}
            >
              Delete forever
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
