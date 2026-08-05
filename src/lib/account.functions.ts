import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Permanently deletes the signed-in user: all owned rows first (RLS-scoped),
 * then the auth identity itself via the admin client.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const userTables = [
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

    for (const table of userTables) {
      await supabase.from(table).delete().eq("user_id", userId);
    }
    await supabase.from("profiles").delete().eq("id", userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });
