/**
 * Translation catalogue. English is the source of truth; every other locale
 * mirrors the same key set and falls back to English for anything missing.
 * User-generated content (journal, letters, wins, custom flags) is never
 * translated — only static UI chrome lives here.
 */

import { screensEn } from "./en/screens";
import { uiEn } from "./en/ui";
import { bn as bnExtra } from "./locales/bn";
import { de as deExtra } from "./locales/de";
import { es as esExtra } from "./locales/es";
import { fr as frExtra } from "./locales/fr";
import { hi as hiExtra } from "./locales/hi";
import { it as itExtra } from "./locales/it";
import { ja as jaExtra } from "./locales/ja";
import { ko as koExtra } from "./locales/ko";
import { nl as nlExtra } from "./locales/nl";
import { pt as ptExtra } from "./locales/pt";
import type { Extra } from "./locales/types";
import { zh as zhExtra } from "./locales/zh";

export const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
    back: "Back",
    remove: "Remove",
    change: "Change",
    upload: "Upload",
    logOut: "Log out",
    logOutQuestion: "Are you sure you want to log out?",
    settings: "Settings",
  },
  nav: {
    home: "Home",
    flags: "Flags",
    wins: "Wins",
    badges: "Badges",
    activity: "Activity",
  },
  drawer: {
    resetDate: "Reset No Contact Date",
    invite: "Invite Friends",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    about: "About",
    restore: "Restore Purchases",
    version: "Version",
    developer: "Developer",
    privacyNote:
      "Privacy commitment: your flags, wins and letters are stored on your device first and only synced to your private account. We never sell or share your data.",
  },
  reset: {
    title: "Reset Streak?",
    description: "This will permanently reset your No Contact timer.",
    action: "Reset",
    pickNew: "Pick your new start",
    since: "No contact since",
    saveNewDate: "Save new date",
    done: "Your no-contact date has been reset.",
    failed: "Couldn't reset right now — it will retry.",
  },
  settings: {
    title: "Settings",
    editProfile: "Edit profile",
    editProfileDesc: "Name, bio and photo.",
    profilePhoto: "Profile photo",
    photoHint: "Upload a photo from your device.",
    cropTitle: "Crop your photo",
    cropHint: "Drag to reposition, pinch or use the slider to zoom.",
    cropPreview: "Preview",
    zoom: "Zoom",
    appearance: "Appearance",
    appearanceDesc: "Light, dark or match your device.",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System default",
    displayName: "Display name",
    bio: "Bio",
    recoveryStart: "Recovery start date",
    saveChanges: "Save changes",
    notifications: "Notifications",
    notificationsDesc: "Choose what you want to hear about.",
    morningReminder: "Morning reminder (9:00)",
    eveningReminder: "Evening reminder (20:00)",
    language: "Language",
    languageDesc: "App language",
    exportTitle: "Export my data",
    exportDesc: "Download a copy as JSON.",
    exportBtn: "Export",
    backup: "Backup & sync",
    connected: "Connected",
    offline: "Offline mode — changes save on this device",
    status: "Status",
    syncing: "Syncing",
    upToDate: "Up to date",
    waiting: "Waiting for network",
    pendingUploads: "Pending uploads",
    lastSync: "Last sync",
    notYet: "Not yet",
    syncNow: "Sync now",
    goPremium: "Go Premium",
    goPremiumDesc: "7 days free, then unlock everything.",
    premiumActive: "Premium active",
    deleteAccount: "Delete account",
    deleteTitle: "Delete account?",
    deleteDesc:
      "All of your cloud data — streak, flags, wins, badges and letters — will be deleted permanently. Confirm with your password to continue.",
    deleteForever: "Delete forever",
    yourPassword: "Your password",
    sendTest: "Send a test notification",
    testSent: "Test push sent to your device.",
    testSentLocal: "Sent a local test notification — remote push isn't configured yet.",
    testFailed: "Couldn't send a test notification on this device.",
    notificationsOn: "Reminders are on.",
    notificationsOnDevice: "Notifications are on for this device.",
    notificationsOff: "Notifications turned off.",
    permissionDenied:
      "Notifications are blocked. You can turn them on any time from your device settings.",
    deleteBody1:
      "Deleting your account will permanently remove all data associated with your account from our servers. This action cannot be undone.",
    deleteBody2:
      "If you simply don't want to use the app right now and may return later, you can safely uninstall the app instead. Your account and progress will remain available when you sign back in.",
    typeDelete: 'Type "delete" to confirm',
    deleteConfirmTitle: "Delete your account?",
    deleteConfirmDesc:
      "This action is permanent and cannot be undone. Are you sure you want to delete your account?",
    keepAccount: "Keep account",
    deletedTitle: "Account deleted",
    deletedDesc:
      "Your account has been permanently deleted. We're sorry to see you go. If you ever decide to return, you're always welcome to create a new account.",
    redirecting: "Redirecting to the Sign In page in {{count}} seconds...",
  },
  notif: {
    daily_motivation: "Daily motivation",
    morning: "Morning reminder (9:00)",
    evening: "Evening reminder (20:00)",
    milestone: "No contact milestone",
    streak: "Streak reminder",
    sos: "SOS encouragement",
    inactivity: "Inactivity reminder",
  },
  home: {
    greeting: "Hi {{name}}",
    yourReset: "Your reset",
    hrs: "hrs",
    min: "min",
    sec: "sec",
  },
  toast: {
    saved: "Saved. It syncs automatically when you're online.",
    languageSaved: "Language updated.",
    exported: "Your data was exported.",
    backupComplete: "Backup complete.",
    loggedOut: "Logged out successfully.",
    photoUpdated: "Profile photo updated.",
    photoRemoved: "Profile photo removed.",
    photoFailed: "We couldn't use that image. Please try another.",
    badgeUnlocked: "🎉 Badge unlocked: {{name}}",
    badgesUnlocked: "🎉 {{count}} badges unlocked: {{names}}",
  },
} as const;

type Catalog = typeof en;
type Deep<T> = { [K in keyof T]?: T[K] extends object ? Deep<T[K]> : string };
export type Translation = Deep<Catalog>;

export const es: Translation = {
  common: { save: "Guardar", cancel: "Cancelar", delete: "Eliminar", close: "Cerrar", back: "Atrás", remove: "Quitar", change: "Cambiar", upload: "Subir", logOut: "Cerrar sesión", logOutQuestion: "¿Seguro que quieres cerrar sesión?", settings: "Ajustes" },
  nav: { home: "Inicio", flags: "Señales", wins: "Logros", badges: "Insignias", activity: "Actividad" },
  drawer: { resetDate: "Restablecer fecha de contacto cero", invite: "Invitar amigos", privacy: "Política de privacidad", terms: "Términos y condiciones", about: "Acerca de", restore: "Restaurar compras", version: "Versión", developer: "Desarrollador", privacyNote: "Compromiso de privacidad: tus señales, logros y cartas se guardan primero en tu dispositivo y solo se sincronizan con tu cuenta privada. Nunca vendemos ni compartimos tus datos." },
  reset: { title: "¿Reiniciar la racha?", description: "Esto reiniciará permanentemente tu temporizador de contacto cero.", action: "Reiniciar", pickNew: "Elige tu nuevo inicio", since: "Sin contacto desde", saveNewDate: "Guardar nueva fecha", done: "Tu fecha de contacto cero se ha restablecido.", failed: "No se pudo reiniciar ahora — se reintentará." },
  settings: { title: "Ajustes", editProfile: "Editar perfil", editProfileDesc: "Nombre, biografía y foto.", profilePhoto: "Foto de perfil", photoHint: "Sube una foto desde tu dispositivo.", displayName: "Nombre visible", bio: "Biografía", recoveryStart: "Fecha de inicio de recuperación", saveChanges: "Guardar cambios", notifications: "Notificaciones", notificationsDesc: "Elige de qué quieres enterarte.", morningReminder: "Recordatorio matutino (9:00)", eveningReminder: "Recordatorio nocturno (20:00)", language: "Idioma", languageDesc: "Idioma de la app", exportTitle: "Exportar mis datos", exportDesc: "Descarga una copia en JSON.", exportBtn: "Exportar", backup: "Copia y sincronización", connected: "Conectado", offline: "Modo sin conexión — los cambios se guardan en este dispositivo", status: "Estado", syncing: "Sincronizando", upToDate: "Al día", waiting: "Esperando red", pendingUploads: "Subidas pendientes", lastSync: "Última sincronización", notYet: "Todavía no", syncNow: "Sincronizar ahora", goPremium: "Hazte Premium", goPremiumDesc: "7 días gratis, luego desbloquea todo.", premiumActive: "Premium activo", deleteAccount: "Eliminar cuenta", deleteTitle: "¿Eliminar cuenta?", deleteDesc: "Todos tus datos en la nube — racha, señales, logros, insignias y cartas — se eliminarán permanentemente. Confirma con tu contraseña para continuar.", deleteForever: "Eliminar para siempre", yourPassword: "Tu contraseña" },
  home: { greeting: "Hola {{name}}", yourReset: "Tu reinicio", hrs: "h", min: "min", sec: "s" },
  toast: { saved: "Guardado. Se sincroniza automáticamente cuando estés en línea.", languageSaved: "Idioma actualizado.", exported: "Tus datos se exportaron.", backupComplete: "Copia completada.", loggedOut: "Sesión cerrada correctamente.", photoUpdated: "Foto de perfil actualizada.", photoRemoved: "Foto de perfil eliminada.", photoFailed: "No pudimos usar esa imagen. Prueba con otra.", badgeUnlocked: "🎉 Insignia desbloqueada: {{name}}", badgesUnlocked: "🎉 {{count}} insignias desbloqueadas: {{names}}" },
};

export const fr: Translation = {
  common: { save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", close: "Fermer", back: "Retour", remove: "Retirer", change: "Modifier", upload: "Téléverser", logOut: "Se déconnecter", logOutQuestion: "Voulez-vous vraiment vous déconnecter ?", settings: "Paramètres" },
  nav: { home: "Accueil", flags: "Signaux", wins: "Victoires", badges: "Badges", activity: "Activité" },
  drawer: { resetDate: "Réinitialiser la date sans contact", invite: "Inviter des amis", privacy: "Politique de confidentialité", terms: "Conditions générales", about: "À propos", restore: "Restaurer les achats", version: "Version", developer: "Développeur", privacyNote: "Engagement de confidentialité : vos signaux, victoires et lettres sont d'abord stockés sur votre appareil et synchronisés uniquement avec votre compte privé. Nous ne vendons ni ne partageons jamais vos données." },
  reset: { title: "Réinitialiser la série ?", description: "Cela réinitialisera définitivement votre minuteur sans contact.", action: "Réinitialiser", pickNew: "Choisissez votre nouveau départ", since: "Sans contact depuis", saveNewDate: "Enregistrer la date", done: "Votre date sans contact a été réinitialisée.", failed: "Impossible pour le moment — nouvelle tentative à venir." },
  settings: { title: "Paramètres", editProfile: "Modifier le profil", editProfileDesc: "Nom, bio et photo.", profilePhoto: "Photo de profil", photoHint: "Téléversez une photo depuis votre appareil.", displayName: "Nom affiché", bio: "Bio", recoveryStart: "Date de début de guérison", saveChanges: "Enregistrer", notifications: "Notifications", notificationsDesc: "Choisissez ce que vous voulez recevoir.", morningReminder: "Rappel du matin (9:00)", eveningReminder: "Rappel du soir (20:00)", language: "Langue", languageDesc: "Langue de l'application", exportTitle: "Exporter mes données", exportDesc: "Téléchargez une copie en JSON.", exportBtn: "Exporter", backup: "Sauvegarde et synchro", connected: "Connecté", offline: "Mode hors ligne — les changements restent sur cet appareil", status: "Statut", syncing: "Synchronisation", upToDate: "À jour", waiting: "En attente du réseau", pendingUploads: "Envois en attente", lastSync: "Dernière synchro", notYet: "Pas encore", syncNow: "Synchroniser", goPremium: "Passer à Premium", goPremiumDesc: "7 jours gratuits, puis tout est débloqué.", premiumActive: "Premium actif", deleteAccount: "Supprimer le compte", deleteTitle: "Supprimer le compte ?", deleteDesc: "Toutes vos données cloud — série, signaux, victoires, badges et lettres — seront définitivement supprimées. Confirmez avec votre mot de passe.", deleteForever: "Supprimer définitivement", yourPassword: "Votre mot de passe" },
  home: { greeting: "Bonjour {{name}}", yourReset: "Votre renaissance", hrs: "h", min: "min", sec: "s" },
  toast: { saved: "Enregistré. La synchro se fait dès que vous êtes en ligne.", languageSaved: "Langue mise à jour.", exported: "Vos données ont été exportées.", backupComplete: "Sauvegarde terminée.", loggedOut: "Déconnexion réussie.", photoUpdated: "Photo de profil mise à jour.", photoRemoved: "Photo de profil supprimée.", photoFailed: "Impossible d'utiliser cette image. Essayez-en une autre.", badgeUnlocked: "🎉 Badge débloqué : {{name}}", badgesUnlocked: "🎉 {{count}} badges débloqués : {{names}}" },
};

export const de: Translation = {
  common: { save: "Speichern", cancel: "Abbrechen", delete: "Löschen", close: "Schließen", back: "Zurück", remove: "Entfernen", change: "Ändern", upload: "Hochladen", logOut: "Abmelden", logOutQuestion: "Möchtest du dich wirklich abmelden?", settings: "Einstellungen" },
  nav: { home: "Start", flags: "Warnzeichen", wins: "Erfolge", badges: "Abzeichen", activity: "Aktivität" },
  drawer: { resetDate: "Kontaktsperre-Datum zurücksetzen", invite: "Freunde einladen", privacy: "Datenschutz", terms: "AGB", about: "Über", restore: "Käufe wiederherstellen", version: "Version", developer: "Entwickler", privacyNote: "Datenschutzversprechen: Deine Warnzeichen, Erfolge und Briefe werden zuerst auf deinem Gerät gespeichert und nur mit deinem privaten Konto synchronisiert. Wir verkaufen oder teilen deine Daten nie." },
  reset: { title: "Serie zurücksetzen?", description: "Damit wird dein Kontaktsperre-Timer dauerhaft zurückgesetzt.", action: "Zurücksetzen", pickNew: "Wähle deinen neuen Start", since: "Kein Kontakt seit", saveNewDate: "Neues Datum speichern", done: "Dein Kontaktsperre-Datum wurde zurückgesetzt.", failed: "Gerade nicht möglich — wird erneut versucht." },
  settings: { title: "Einstellungen", editProfile: "Profil bearbeiten", editProfileDesc: "Name, Bio und Foto.", profilePhoto: "Profilfoto", photoHint: "Lade ein Foto von deinem Gerät hoch.", displayName: "Anzeigename", bio: "Bio", recoveryStart: "Startdatum der Heilung", saveChanges: "Änderungen speichern", notifications: "Benachrichtigungen", notificationsDesc: "Wähle, worüber du hören möchtest.", morningReminder: "Morgen-Erinnerung (9:00)", eveningReminder: "Abend-Erinnerung (20:00)", language: "Sprache", languageDesc: "App-Sprache", exportTitle: "Meine Daten exportieren", exportDesc: "Als JSON herunterladen.", exportBtn: "Exportieren", backup: "Backup & Sync", connected: "Verbunden", offline: "Offline-Modus — Änderungen bleiben auf diesem Gerät", status: "Status", syncing: "Synchronisiert", upToDate: "Aktuell", waiting: "Warte auf Netzwerk", pendingUploads: "Ausstehende Uploads", lastSync: "Letzte Sync", notYet: "Noch nicht", syncNow: "Jetzt synchronisieren", goPremium: "Premium holen", goPremiumDesc: "7 Tage gratis, danach alles freigeschaltet.", premiumActive: "Premium aktiv", deleteAccount: "Konto löschen", deleteTitle: "Konto löschen?", deleteDesc: "Alle Cloud-Daten — Serie, Warnzeichen, Erfolge, Abzeichen und Briefe — werden dauerhaft gelöscht. Bestätige mit deinem Passwort.", deleteForever: "Endgültig löschen", yourPassword: "Dein Passwort" },
  home: { greeting: "Hallo {{name}}", yourReset: "Dein Neuanfang", hrs: "Std", min: "Min", sec: "Sek" },
  toast: { saved: "Gespeichert. Wird online automatisch synchronisiert.", languageSaved: "Sprache aktualisiert.", exported: "Deine Daten wurden exportiert.", backupComplete: "Backup abgeschlossen.", loggedOut: "Erfolgreich abgemeldet.", photoUpdated: "Profilfoto aktualisiert.", photoRemoved: "Profilfoto entfernt.", photoFailed: "Dieses Bild ging nicht. Bitte versuche ein anderes.", badgeUnlocked: "🎉 Abzeichen freigeschaltet: {{name}}", badgesUnlocked: "🎉 {{count}} Abzeichen freigeschaltet: {{names}}" },
};

export const it: Translation = {
  common: { save: "Salva", cancel: "Annulla", delete: "Elimina", close: "Chiudi", back: "Indietro", remove: "Rimuovi", change: "Cambia", upload: "Carica", logOut: "Esci", logOutQuestion: "Vuoi davvero uscire?", settings: "Impostazioni" },
  nav: { home: "Home", flags: "Segnali", wins: "Successi", badges: "Distintivi", activity: "Attività" },
  drawer: { resetDate: "Reimposta la data del no contatto", invite: "Invita amici", privacy: "Informativa privacy", terms: "Termini e condizioni", about: "Info", restore: "Ripristina acquisti", version: "Versione", developer: "Sviluppatore", privacyNote: "Impegno sulla privacy: segnali, successi e lettere restano prima sul tuo dispositivo e si sincronizzano solo con il tuo account privato. Non vendiamo né condividiamo mai i tuoi dati." },
  reset: { title: "Azzerare la serie?", description: "Il timer del no contatto verrà azzerato definitivamente.", action: "Azzera", pickNew: "Scegli il nuovo inizio", since: "Nessun contatto da", saveNewDate: "Salva nuova data", done: "La tua data di no contatto è stata reimpostata.", failed: "Non è possibile ora — riproveremo." },
  settings: { title: "Impostazioni", editProfile: "Modifica profilo", editProfileDesc: "Nome, bio e foto.", profilePhoto: "Foto profilo", photoHint: "Carica una foto dal tuo dispositivo.", displayName: "Nome visualizzato", bio: "Bio", recoveryStart: "Data di inizio percorso", saveChanges: "Salva modifiche", notifications: "Notifiche", notificationsDesc: "Scegli cosa vuoi ricevere.", morningReminder: "Promemoria mattutino (9:00)", eveningReminder: "Promemoria serale (20:00)", language: "Lingua", languageDesc: "Lingua dell'app", exportTitle: "Esporta i miei dati", exportDesc: "Scarica una copia in JSON.", exportBtn: "Esporta", backup: "Backup e sincronizzazione", connected: "Connesso", offline: "Modalità offline — le modifiche restano su questo dispositivo", status: "Stato", syncing: "Sincronizzazione", upToDate: "Aggiornato", waiting: "In attesa di rete", pendingUploads: "Caricamenti in sospeso", lastSync: "Ultima sincronizzazione", notYet: "Non ancora", syncNow: "Sincronizza ora", goPremium: "Passa a Premium", goPremiumDesc: "7 giorni gratis, poi sblocchi tutto.", premiumActive: "Premium attivo", deleteAccount: "Elimina account", deleteTitle: "Eliminare l'account?", deleteDesc: "Tutti i dati nel cloud — serie, segnali, successi, distintivi e lettere — saranno eliminati definitivamente. Conferma con la password.", deleteForever: "Elimina per sempre", yourPassword: "La tua password" },
  home: { greeting: "Ciao {{name}}", yourReset: "Il tuo nuovo inizio", hrs: "ore", min: "min", sec: "sec" },
  toast: { saved: "Salvato. Si sincronizza appena sei online.", languageSaved: "Lingua aggiornata.", exported: "I tuoi dati sono stati esportati.", backupComplete: "Backup completato.", loggedOut: "Uscita effettuata.", photoUpdated: "Foto profilo aggiornata.", photoRemoved: "Foto profilo rimossa.", photoFailed: "Non siamo riusciti a usare quell'immagine. Provane un'altra.", badgeUnlocked: "🎉 Distintivo sbloccato: {{name}}", badgesUnlocked: "🎉 {{count}} distintivi sbloccati: {{names}}" },
};

export const pt: Translation = {
  common: { save: "Salvar", cancel: "Cancelar", delete: "Excluir", close: "Fechar", back: "Voltar", remove: "Remover", change: "Alterar", upload: "Enviar", logOut: "Sair", logOutQuestion: "Tem certeza de que deseja sair?", settings: "Configurações" },
  nav: { home: "Início", flags: "Sinais", wins: "Conquistas", badges: "Medalhas", activity: "Atividade" },
  drawer: { resetDate: "Redefinir data do sem contato", invite: "Convidar amigos", privacy: "Política de privacidade", terms: "Termos e condições", about: "Sobre", restore: "Restaurar compras", version: "Versão", developer: "Desenvolvedor", privacyNote: "Compromisso de privacidade: seus sinais, conquistas e cartas ficam primeiro no seu aparelho e só são sincronizados com sua conta privada. Nunca vendemos nem compartilhamos seus dados." },
  reset: { title: "Zerar a sequência?", description: "Isso vai zerar permanentemente seu cronômetro de sem contato.", action: "Zerar", pickNew: "Escolha o novo início", since: "Sem contato desde", saveNewDate: "Salvar nova data", done: "Sua data de sem contato foi redefinida.", failed: "Não deu certo agora — tentaremos de novo." },
  settings: { title: "Configurações", editProfile: "Editar perfil", editProfileDesc: "Nome, bio e foto.", profilePhoto: "Foto de perfil", photoHint: "Envie uma foto do seu aparelho.", displayName: "Nome de exibição", bio: "Bio", recoveryStart: "Data de início da recuperação", saveChanges: "Salvar alterações", notifications: "Notificações", notificationsDesc: "Escolha o que quer receber.", morningReminder: "Lembrete da manhã (9:00)", eveningReminder: "Lembrete da noite (20:00)", language: "Idioma", languageDesc: "Idioma do app", exportTitle: "Exportar meus dados", exportDesc: "Baixe uma cópia em JSON.", exportBtn: "Exportar", backup: "Backup e sincronização", connected: "Conectado", offline: "Modo offline — as mudanças ficam neste aparelho", status: "Status", syncing: "Sincronizando", upToDate: "Em dia", waiting: "Aguardando rede", pendingUploads: "Envios pendentes", lastSync: "Última sincronização", notYet: "Ainda não", syncNow: "Sincronizar agora", goPremium: "Assinar Premium", goPremiumDesc: "7 dias grátis, depois tudo liberado.", premiumActive: "Premium ativo", deleteAccount: "Excluir conta", deleteTitle: "Excluir conta?", deleteDesc: "Todos os seus dados na nuvem — sequência, sinais, conquistas, medalhas e cartas — serão excluídos permanentemente. Confirme com sua senha.", deleteForever: "Excluir para sempre", yourPassword: "Sua senha" },
  home: { greeting: "Oi {{name}}", yourReset: "Seu recomeço", hrs: "h", min: "min", sec: "s" },
  toast: { saved: "Salvo. Sincroniza automaticamente quando você estiver online.", languageSaved: "Idioma atualizado.", exported: "Seus dados foram exportados.", backupComplete: "Backup concluído.", loggedOut: "Você saiu com sucesso.", photoUpdated: "Foto de perfil atualizada.", photoRemoved: "Foto de perfil removida.", photoFailed: "Não conseguimos usar essa imagem. Tente outra.", badgeUnlocked: "🎉 Medalha desbloqueada: {{name}}", badgesUnlocked: "🎉 {{count}} medalhas desbloqueadas: {{names}}" },
};

export const nl: Translation = {
  common: { save: "Opslaan", cancel: "Annuleren", delete: "Verwijderen", close: "Sluiten", back: "Terug", remove: "Wissen", change: "Wijzigen", upload: "Uploaden", logOut: "Uitloggen", logOutQuestion: "Weet je zeker dat je wilt uitloggen?", settings: "Instellingen" },
  nav: { home: "Home", flags: "Signalen", wins: "Successen", badges: "Badges", activity: "Activiteit" },
  drawer: { resetDate: "Geen-contactdatum resetten", invite: "Vrienden uitnodigen", privacy: "Privacybeleid", terms: "Voorwaarden", about: "Over", restore: "Aankopen herstellen", version: "Versie", developer: "Ontwikkelaar", privacyNote: "Privacybelofte: je signalen, successen en brieven staan eerst op je toestel en worden alleen met je privéaccount gesynchroniseerd. We verkopen of delen je gegevens nooit." },
  reset: { title: "Reeks resetten?", description: "Hiermee reset je je geen-contact-timer definitief.", action: "Resetten", pickNew: "Kies je nieuwe start", since: "Geen contact sinds", saveNewDate: "Nieuwe datum opslaan", done: "Je geen-contactdatum is gereset.", failed: "Lukt nu niet — we proberen het opnieuw." },
  settings: { title: "Instellingen", editProfile: "Profiel bewerken", editProfileDesc: "Naam, bio en foto.", profilePhoto: "Profielfoto", photoHint: "Upload een foto vanaf je toestel.", displayName: "Weergavenaam", bio: "Bio", recoveryStart: "Startdatum herstel", saveChanges: "Wijzigingen opslaan", notifications: "Meldingen", notificationsDesc: "Kies waarover je bericht wilt.", morningReminder: "Ochtendherinnering (9:00)", eveningReminder: "Avondherinnering (20:00)", language: "Taal", languageDesc: "App-taal", exportTitle: "Mijn gegevens exporteren", exportDesc: "Download een kopie als JSON.", exportBtn: "Exporteren", backup: "Back-up & sync", connected: "Verbonden", offline: "Offlinemodus — wijzigingen blijven op dit toestel", status: "Status", syncing: "Synchroniseren", upToDate: "Bijgewerkt", waiting: "Wacht op netwerk", pendingUploads: "Wachtende uploads", lastSync: "Laatste sync", notYet: "Nog niet", syncNow: "Nu synchroniseren", goPremium: "Word Premium", goPremiumDesc: "7 dagen gratis, daarna alles vrij.", premiumActive: "Premium actief", deleteAccount: "Account verwijderen", deleteTitle: "Account verwijderen?", deleteDesc: "Al je clouddata — reeks, signalen, successen, badges en brieven — wordt permanent verwijderd. Bevestig met je wachtwoord.", deleteForever: "Definitief verwijderen", yourPassword: "Je wachtwoord" },
  home: { greeting: "Hoi {{name}}", yourReset: "Jouw nieuwe start", hrs: "uur", min: "min", sec: "sec" },
  toast: { saved: "Opgeslagen. Synchroniseert vanzelf zodra je online bent.", languageSaved: "Taal bijgewerkt.", exported: "Je gegevens zijn geëxporteerd.", backupComplete: "Back-up voltooid.", loggedOut: "Je bent uitgelogd.", photoUpdated: "Profielfoto bijgewerkt.", photoRemoved: "Profielfoto verwijderd.", photoFailed: "Deze afbeelding lukte niet. Probeer een andere.", badgeUnlocked: "🎉 Badge ontgrendeld: {{name}}", badgesUnlocked: "🎉 {{count}} badges ontgrendeld: {{names}}" },
};

export const hi: Translation = {
  common: { save: "सहेजें", cancel: "रद्द करें", delete: "हटाएँ", close: "बंद करें", back: "वापस", remove: "हटाएँ", change: "बदलें", upload: "अपलोड करें", logOut: "लॉग आउट", logOutQuestion: "क्या आप वाकई लॉग आउट करना चाहते हैं?", settings: "सेटिंग्स" },
  nav: { home: "होम", flags: "संकेत", wins: "उपलब्धियाँ", badges: "बैज", activity: "गतिविधि" },
  drawer: { resetDate: "नो-कॉन्टैक्ट तिथि रीसेट करें", invite: "दोस्तों को बुलाएँ", privacy: "गोपनीयता नीति", terms: "नियम एवं शर्तें", about: "ऐप के बारे में", restore: "खरीद बहाल करें", version: "संस्करण", developer: "डेवलपर", privacyNote: "गोपनीयता वादा: आपके संकेत, उपलब्धियाँ और पत्र पहले आपके डिवाइस पर सुरक्षित रहते हैं और केवल आपके निजी खाते से सिंक होते हैं। हम आपका डेटा कभी नहीं बेचते या साझा करते।" },
  reset: { title: "स्ट्रीक रीसेट करें?", description: "इससे आपका नो-कॉन्टैक्ट टाइमर स्थायी रूप से रीसेट हो जाएगा।", action: "रीसेट", pickNew: "नई शुरुआत चुनें", since: "इस समय से कोई संपर्क नहीं", saveNewDate: "नई तिथि सहेजें", done: "आपकी नो-कॉन्टैक्ट तिथि रीसेट हो गई।", failed: "अभी नहीं हो सका — दोबारा कोशिश होगी।" },
  settings: { title: "सेटिंग्स", editProfile: "प्रोफ़ाइल संपादित करें", editProfileDesc: "नाम, परिचय और फ़ोटो।", profilePhoto: "प्रोफ़ाइल फ़ोटो", photoHint: "अपने डिवाइस से फ़ोटो अपलोड करें।", displayName: "प्रदर्शित नाम", bio: "परिचय", recoveryStart: "रिकवरी प्रारंभ तिथि", saveChanges: "बदलाव सहेजें", notifications: "सूचनाएँ", notificationsDesc: "चुनें कि आप क्या सुनना चाहते हैं।", morningReminder: "सुबह की याद (9:00)", eveningReminder: "शाम की याद (20:00)", language: "भाषा", languageDesc: "ऐप की भाषा", exportTitle: "मेरा डेटा निर्यात करें", exportDesc: "JSON में प्रति डाउनलोड करें।", exportBtn: "निर्यात", backup: "बैकअप और सिंक", connected: "जुड़ा हुआ", offline: "ऑफ़लाइन मोड — बदलाव इसी डिवाइस पर सहेजे जाते हैं", status: "स्थिति", syncing: "सिंक हो रहा है", upToDate: "अपडेटेड", waiting: "नेटवर्क का इंतज़ार", pendingUploads: "लंबित अपलोड", lastSync: "अंतिम सिंक", notYet: "अभी नहीं", syncNow: "अभी सिंक करें", goPremium: "प्रीमियम लें", goPremiumDesc: "7 दिन मुफ़्त, फिर सब कुछ अनलॉक।", premiumActive: "प्रीमियम सक्रिय", deleteAccount: "खाता हटाएँ", deleteTitle: "खाता हटाएँ?", deleteDesc: "आपका सारा क्लाउड डेटा — स्ट्रीक, संकेत, उपलब्धियाँ, बैज और पत्र — स्थायी रूप से हट जाएगा। जारी रखने के लिए पासवर्ड डालें।", deleteForever: "हमेशा के लिए हटाएँ", yourPassword: "आपका पासवर्ड" },
  home: { greeting: "नमस्ते {{name}}", yourReset: "आपकी नई शुरुआत", hrs: "घं", min: "मि", sec: "से" },
  toast: { saved: "सहेजा गया। ऑनलाइन होते ही अपने आप सिंक होगा।", languageSaved: "भाषा अपडेट हुई।", exported: "आपका डेटा निर्यात हो गया।", backupComplete: "बैकअप पूरा हुआ।", loggedOut: "सफलतापूर्वक लॉग आउट हुआ।", photoUpdated: "प्रोफ़ाइल फ़ोटो अपडेट हुई।", photoRemoved: "प्रोफ़ाइल फ़ोटो हटाई गई।", photoFailed: "यह छवि उपयोग नहीं हो सकी। कोई और चुनें।", badgeUnlocked: "🎉 बैज अनलॉक: {{name}}", badgesUnlocked: "🎉 {{count}} बैज अनलॉक: {{names}}" },
};

export const bn: Translation = {
  common: { save: "সংরক্ষণ", cancel: "বাতিল", delete: "মুছুন", close: "বন্ধ", back: "ফিরুন", remove: "সরান", change: "পরিবর্তন", upload: "আপলোড", logOut: "লগ আউট", logOutQuestion: "আপনি কি সত্যিই লগ আউট করতে চান?", settings: "সেটিংস" },
  nav: { home: "হোম", flags: "সংকেত", wins: "সাফল্য", badges: "ব্যাজ", activity: "কার্যক্রম" },
  drawer: { resetDate: "নো-কনট্যাক্ট তারিখ রিসেট", invite: "বন্ধুদের আমন্ত্রণ", privacy: "গোপনীয়তা নীতি", terms: "শর্তাবলি", about: "সম্পর্কে", restore: "ক্রয় পুনরুদ্ধার", version: "সংস্করণ", developer: "ডেভেলপার", privacyNote: "গোপনীয়তার অঙ্গীকার: আপনার সংকেত, সাফল্য ও চিঠি প্রথমে আপনার ডিভাইসে থাকে এবং কেবল আপনার ব্যক্তিগত অ্যাকাউন্টে সিঙ্ক হয়। আমরা কখনও আপনার তথ্য বিক্রি বা শেয়ার করি না।" },
  reset: { title: "স্ট্রিক রিসেট করবেন?", description: "এতে আপনার নো-কনট্যাক্ট টাইমার স্থায়ীভাবে রিসেট হবে।", action: "রিসেট", pickNew: "নতুন শুরু বেছে নিন", since: "যখন থেকে যোগাযোগ নেই", saveNewDate: "নতুন তারিখ সংরক্ষণ", done: "আপনার নো-কনট্যাক্ট তারিখ রিসেট হয়েছে।", failed: "এখন সম্ভব হলো না — আবার চেষ্টা হবে।" },
  settings: { title: "সেটিংস", editProfile: "প্রোফাইল সম্পাদনা", editProfileDesc: "নাম, পরিচিতি ও ছবি।", profilePhoto: "প্রোফাইল ছবি", photoHint: "আপনার ডিভাইস থেকে ছবি আপলোড করুন।", displayName: "প্রদর্শিত নাম", bio: "পরিচিতি", recoveryStart: "পুনরুদ্ধার শুরুর তারিখ", saveChanges: "পরিবর্তন সংরক্ষণ", notifications: "বিজ্ঞপ্তি", notificationsDesc: "কী জানতে চান তা বেছে নিন।", morningReminder: "সকালের রিমাইন্ডার (9:00)", eveningReminder: "সন্ধ্যার রিমাইন্ডার (20:00)", language: "ভাষা", languageDesc: "অ্যাপের ভাষা", exportTitle: "আমার তথ্য রপ্তানি", exportDesc: "JSON হিসেবে কপি ডাউনলোড করুন।", exportBtn: "রপ্তানি", backup: "ব্যাকআপ ও সিঙ্ক", connected: "সংযুক্ত", offline: "অফলাইন মোড — পরিবর্তন এই ডিভাইসে থাকে", status: "অবস্থা", syncing: "সিঙ্ক হচ্ছে", upToDate: "হালনাগাদ", waiting: "নেটওয়ার্কের অপেক্ষা", pendingUploads: "অপেক্ষমাণ আপলোড", lastSync: "শেষ সিঙ্ক", notYet: "এখনও নয়", syncNow: "এখনই সিঙ্ক", goPremium: "প্রিমিয়াম নিন", goPremiumDesc: "৭ দিন ফ্রি, তারপর সব আনলক।", premiumActive: "প্রিমিয়াম সক্রিয়", deleteAccount: "অ্যাকাউন্ট মুছুন", deleteTitle: "অ্যাকাউন্ট মুছবেন?", deleteDesc: "আপনার সব ক্লাউড ডেটা — স্ট্রিক, সংকেত, সাফল্য, ব্যাজ ও চিঠি — স্থায়ীভাবে মুছে যাবে। চালিয়ে যেতে পাসওয়ার্ড দিন।", deleteForever: "চিরতরে মুছুন", yourPassword: "আপনার পাসওয়ার্ড" },
  home: { greeting: "হাই {{name}}", yourReset: "আপনার নতুন শুরু", hrs: "ঘ", min: "মি", sec: "সে" },
  toast: { saved: "সংরক্ষিত। অনলাইনে গেলে নিজেই সিঙ্ক হবে।", languageSaved: "ভাষা হালনাগাদ হয়েছে।", exported: "আপনার তথ্য রপ্তানি হয়েছে।", backupComplete: "ব্যাকআপ সম্পন্ন।", loggedOut: "সফলভাবে লগ আউট হয়েছে।", photoUpdated: "প্রোফাইল ছবি হালনাগাদ হয়েছে।", photoRemoved: "প্রোফাইল ছবি সরানো হয়েছে।", photoFailed: "ছবিটি ব্যবহার করা গেল না। অন্যটি চেষ্টা করুন।", badgeUnlocked: "🎉 ব্যাজ আনলক: {{name}}", badgesUnlocked: "🎉 {{count}}টি ব্যাজ আনলক: {{names}}" },
};

export const ja: Translation = {
  common: { save: "保存", cancel: "キャンセル", delete: "削除", close: "閉じる", back: "戻る", remove: "削除", change: "変更", upload: "アップロード", logOut: "ログアウト", logOutQuestion: "ログアウトしてもよろしいですか？", settings: "設定" },
  nav: { home: "ホーム", flags: "サイン", wins: "成果", badges: "バッジ", activity: "アクティビティ" },
  drawer: { resetDate: "ノーコンタクト日をリセット", invite: "友達を招待", privacy: "プライバシーポリシー", terms: "利用規約", about: "アプリについて", restore: "購入を復元", version: "バージョン", developer: "開発者", privacyNote: "プライバシーの約束：サイン・成果・手紙はまず端末に保存され、あなた専用のアカウントにのみ同期されます。データを販売・共有することはありません。" },
  reset: { title: "連続記録をリセットしますか？", description: "ノーコンタクトのタイマーが完全にリセットされます。", action: "リセット", pickNew: "新しい開始日を選ぶ", since: "連絡を絶った日時", saveNewDate: "新しい日付を保存", done: "ノーコンタクト日をリセットしました。", failed: "今は実行できません — 後で再試行します。" },
  settings: { title: "設定", editProfile: "プロフィール編集", editProfileDesc: "名前・自己紹介・写真。", profilePhoto: "プロフィール写真", photoHint: "端末から写真をアップロードします。", displayName: "表示名", bio: "自己紹介", recoveryStart: "回復の開始日", saveChanges: "変更を保存", notifications: "通知", notificationsDesc: "受け取りたい内容を選択。", morningReminder: "朝のリマインダー（9:00）", eveningReminder: "夜のリマインダー（20:00）", language: "言語", languageDesc: "アプリの言語", exportTitle: "データを書き出す", exportDesc: "JSON形式でダウンロード。", exportBtn: "書き出す", backup: "バックアップと同期", connected: "接続中", offline: "オフライン — 変更はこの端末に保存されます", status: "状態", syncing: "同期中", upToDate: "最新", waiting: "ネットワーク待ち", pendingUploads: "保留中のアップロード", lastSync: "最終同期", notYet: "まだ", syncNow: "今すぐ同期", goPremium: "プレミアムへ", goPremiumDesc: "7日間無料、その後すべて解放。", premiumActive: "プレミアム有効", deleteAccount: "アカウント削除", deleteTitle: "アカウントを削除しますか？", deleteDesc: "連続記録・サイン・成果・バッジ・手紙などクラウド上のデータがすべて完全に削除されます。パスワードで確認してください。", deleteForever: "完全に削除", yourPassword: "パスワード" },
  home: { greeting: "こんにちは、{{name}}さん", yourReset: "あなたのリセット", hrs: "時間", min: "分", sec: "秒" },
  toast: { saved: "保存しました。オンラインになると自動で同期します。", languageSaved: "言語を更新しました。", exported: "データを書き出しました。", backupComplete: "バックアップ完了。", loggedOut: "ログアウトしました。", photoUpdated: "プロフィール写真を更新しました。", photoRemoved: "プロフィール写真を削除しました。", photoFailed: "この画像は使用できませんでした。別の画像をお試しください。", badgeUnlocked: "🎉 バッジ獲得：{{name}}", badgesUnlocked: "🎉 バッジ{{count}}個を獲得：{{names}}" },
};

export const ko: Translation = {
  common: { save: "저장", cancel: "취소", delete: "삭제", close: "닫기", back: "뒤로", remove: "제거", change: "변경", upload: "업로드", logOut: "로그아웃", logOutQuestion: "정말 로그아웃하시겠어요?", settings: "설정" },
  nav: { home: "홈", flags: "신호", wins: "성취", badges: "배지", activity: "활동" },
  drawer: { resetDate: "무연락 날짜 재설정", invite: "친구 초대", privacy: "개인정보 처리방침", terms: "이용약관", about: "정보", restore: "구매 복원", version: "버전", developer: "개발자", privacyNote: "개인정보 약속: 신호, 성취, 편지는 먼저 기기에 저장되며 개인 계정으로만 동기화됩니다. 데이터를 절대 판매하거나 공유하지 않습니다." },
  reset: { title: "연속 기록을 초기화할까요?", description: "무연락 타이머가 영구적으로 초기화됩니다.", action: "초기화", pickNew: "새로운 시작 선택", since: "무연락 시작 시점", saveNewDate: "새 날짜 저장", done: "무연락 날짜가 재설정되었습니다.", failed: "지금은 실패했어요 — 다시 시도합니다." },
  settings: { title: "설정", editProfile: "프로필 편집", editProfileDesc: "이름, 소개, 사진.", profilePhoto: "프로필 사진", photoHint: "기기에서 사진을 업로드하세요.", displayName: "표시 이름", bio: "소개", recoveryStart: "회복 시작일", saveChanges: "변경사항 저장", notifications: "알림", notificationsDesc: "받고 싶은 알림을 선택하세요.", morningReminder: "아침 알림 (9:00)", eveningReminder: "저녁 알림 (20:00)", language: "언어", languageDesc: "앱 언어", exportTitle: "내 데이터 내보내기", exportDesc: "JSON으로 사본을 받으세요.", exportBtn: "내보내기", backup: "백업 및 동기화", connected: "연결됨", offline: "오프라인 — 변경사항은 이 기기에 저장됩니다", status: "상태", syncing: "동기화 중", upToDate: "최신", waiting: "네트워크 대기 중", pendingUploads: "대기 중인 업로드", lastSync: "마지막 동기화", notYet: "아직 없음", syncNow: "지금 동기화", goPremium: "프리미엄 시작", goPremiumDesc: "7일 무료, 이후 모두 잠금 해제.", premiumActive: "프리미엄 사용 중", deleteAccount: "계정 삭제", deleteTitle: "계정을 삭제할까요?", deleteDesc: "연속 기록, 신호, 성취, 배지, 편지 등 모든 클라우드 데이터가 영구 삭제됩니다. 비밀번호로 확인하세요.", deleteForever: "영구 삭제", yourPassword: "비밀번호" },
  home: { greeting: "안녕하세요 {{name}}님", yourReset: "당신의 새 출발", hrs: "시간", min: "분", sec: "초" },
  toast: { saved: "저장했어요. 온라인이 되면 자동으로 동기화됩니다.", languageSaved: "언어가 변경되었습니다.", exported: "데이터를 내보냈습니다.", backupComplete: "백업 완료.", loggedOut: "로그아웃되었습니다.", photoUpdated: "프로필 사진을 변경했습니다.", photoRemoved: "프로필 사진을 삭제했습니다.", photoFailed: "이 이미지는 사용할 수 없어요. 다른 사진을 선택해 주세요.", badgeUnlocked: "🎉 배지 획득: {{name}}", badgesUnlocked: "🎉 배지 {{count}}개 획득: {{names}}" },
};

export const zh: Translation = {
  common: { save: "保存", cancel: "取消", delete: "删除", close: "关闭", back: "返回", remove: "移除", change: "更换", upload: "上传", logOut: "退出登录", logOutQuestion: "确定要退出登录吗？", settings: "设置" },
  nav: { home: "首页", flags: "警示", wins: "成就", badges: "徽章", activity: "活动" },
  drawer: { resetDate: "重置断联日期", invite: "邀请好友", privacy: "隐私政策", terms: "条款与条件", about: "关于", restore: "恢复购买", version: "版本", developer: "开发者", privacyNote: "隐私承诺：你的警示、成就与信件先保存在本机，仅同步到你的私人账户。我们绝不出售或分享你的数据。" },
  reset: { title: "重置连续记录？", description: "这将永久重置你的断联计时。", action: "重置", pickNew: "选择新的起点", since: "断联起始时间", saveNewDate: "保存新日期", done: "断联日期已重置。", failed: "暂时无法重置 — 稍后会自动重试。" },
  settings: { title: "设置", editProfile: "编辑资料", editProfileDesc: "姓名、简介与照片。", profilePhoto: "头像", photoHint: "从设备上传一张照片。", displayName: "显示名称", bio: "简介", recoveryStart: "恢复开始日期", saveChanges: "保存更改", notifications: "通知", notificationsDesc: "选择你想收到的提醒。", morningReminder: "早间提醒（9:00）", eveningReminder: "晚间提醒（20:00）", language: "语言", languageDesc: "应用语言", exportTitle: "导出我的数据", exportDesc: "下载 JSON 副本。", exportBtn: "导出", backup: "备份与同步", connected: "已连接", offline: "离线模式 — 更改保存在本机", status: "状态", syncing: "同步中", upToDate: "已是最新", waiting: "等待网络", pendingUploads: "待上传", lastSync: "上次同步", notYet: "尚未同步", syncNow: "立即同步", goPremium: "升级高级版", goPremiumDesc: "7 天免费，之后解锁全部。", premiumActive: "高级版已启用", deleteAccount: "删除账户", deleteTitle: "删除账户？", deleteDesc: "你的全部云端数据 — 连续记录、警示、成就、徽章与信件 — 将被永久删除。请输入密码确认。", deleteForever: "永久删除", yourPassword: "你的密码" },
  home: { greeting: "你好，{{name}}", yourReset: "你的重启", hrs: "小时", min: "分", sec: "秒" },
  toast: { saved: "已保存，联网后会自动同步。", languageSaved: "语言已更新。", exported: "数据已导出。", backupComplete: "备份完成。", loggedOut: "已退出登录。", photoUpdated: "头像已更新。", photoRemoved: "头像已移除。", photoFailed: "无法使用该图片，请换一张。", badgeUnlocked: "🎉 解锁徽章：{{name}}", badgesUnlocked: "🎉 解锁 {{count}} 枚徽章：{{names}}" },
};

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "简体中文" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const base: Record<LanguageCode, Translation> = {
  en,
  es,
  fr,
  de,
  it,
  pt,
  nl,
  hi,
  bn,
  ja,
  ko,
  zh,
};

const extra: Partial<Record<LanguageCode, Extra>> = {
  es: esExtra,
  fr: frExtra,
  de: deExtra,
  it: itExtra,
  pt: ptExtra,
  nl: nlExtra,
  hi: hiExtra,
  bn: bnExtra,
  ja: jaExtra,
  ko: koExtra,
  zh: zhExtra,
};

/** Shallow-per-namespace merge: a locale may override any subset of keys. */
function mergeCatalog(...parts: Record<string, unknown>[]): Record<string, unknown> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const part of parts) {
    for (const [ns, values] of Object.entries(part ?? {})) {
      out[ns] = { ...(out[ns] ?? {}), ...(values as Record<string, unknown>) };
    }
  }
  return out;
}

const english = mergeCatalog(en as never, screensEn as never, uiEn as never);

export const resources = Object.fromEntries(
  LANGUAGES.map(({ code }) => [
    code,
    {
      translation:
        code === "en"
          ? english
          : mergeCatalog(
              english,
              base[code] as never,
              (extra[code] ?? {}) as never,
            ),
    },
  ]),
) as Record<LanguageCode, { translation: Record<string, unknown> }> & {
  en: { translation: typeof en };
};