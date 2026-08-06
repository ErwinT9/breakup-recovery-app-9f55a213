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

/** Lists every object under a prefix, walking nested folders. */
async function listAllPaths(
  storage: { list: (path: string, opts: { limit: number }) => Promise<{ data: Array<{ name: string; id: string | null }> | null; error: unknown }> },
  prefix: string,
): Promise<string[]> {
  const { data, error } = await storage.list(prefix, { limit: 1000 });
  if (error) throw error;
  const paths: string[] = [];
  for (const entry of data ?? []) {
    const full = `${prefix}/${entry.name}`;
    // Folders come back with a null id.
    if (entry.id === null) paths.push(...(await listAllPaths(storage, full)));
    else paths.push(full);
  }
  return paths;
}

/** Never leak internal configuration details to the client. */
function friendlyFailure(error: unknown): never {
  console.error(
    "[deleteMyAccount] failed:",
    error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : JSON.stringify(error),
  );
  throw new Error(
    `DEBUG: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
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
      const bucket = supabaseAdmin.storage.from(PICTURE_BUCKET);
      const paths = await listAllPaths(bucket as never, userId);
      if (paths.length) {
        const { error: removeError } = await bucket.remove(paths);
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
