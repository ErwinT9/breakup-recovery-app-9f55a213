import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const USER_TABLES = [
  "affirmations",
  "badges",
  "daily_promises",
  "flags",
  "journal_entries",
  "letters",
  "mood_checkins",
  "pictures",
  "push_tokens",
  "questionnaire_answers",
  "rituals",
  "streaks",
  "triggers",
  "wins",
] as const;

const PICTURE_BUCKET = "activity-pictures";

/** Never leak internal configuration details to the client. */
function friendlyFailure(error: unknown): never {
  console.error("[deleteMyAccount]", error);
  throw new Error(
    "We couldn't delete your account right now. Please try again in a moment or contact support.",
  );
}

/**
 * Permanently deletes the signed-in user: every owned row, their storage
 * objects, and finally the auth identity. All writes run through the service
 * role so nothing can be silently skipped by a row-level policy.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    if (!userId) friendlyFailure(new Error("No user id on validated session"));

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Storage objects owned by the user (files live under `<uid>/…`).
      const { data: files } = await supabaseAdmin.storage.from(PICTURE_BUCKET).list(userId, {
        limit: 1000,
      });
      if (files?.length) {
        const paths = files.map((file) => `${userId}/${file.name}`);
        const { error: removeError } = await supabaseAdmin.storage
          .from(PICTURE_BUCKET)
          .remove(paths);
        if (removeError) throw removeError;
      }

      // 2. Every owned row. Errors surface instead of leaving orphans behind.
      for (const table of USER_TABLES) {
        const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
        if (error) throw error;
      }
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (profileError) throw profileError;

      // 3. The auth identity itself.
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;

      return { ok: true as const };
    } catch (error) {
      friendlyFailure(error);
    }
  });
