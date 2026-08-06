import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
];

const BUCKET = "activity-pictures";

// deno-lint-ignore no-explicit-any
async function listAllPaths(bucket: any, prefix: string): Promise<string[]> {
  const { data, error } = await bucket.list(prefix, { limit: 1000 });
  if (error) throw error;
  const paths: string[] = [];
  for (const entry of data ?? []) {
    const full = `${prefix}/${entry.name}`;
    if (entry.id === null) paths.push(...(await listAllPaths(bucket, full)));
    else paths.push(full);
  }
  return paths;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.slice("Bearer ".length);

    // 1. Verify the caller with their own token.
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    const userId = userData?.user?.id;
    if (userError || !userId) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 2. Storage objects (files live under `<uid>/…`).
    const bucket = admin.storage.from(BUCKET);
    const paths = await listAllPaths(bucket, userId);
    if (paths.length) {
      const { error } = await bucket.remove(paths);
      if (error) throw error;
    }

    // 3. Every owned row.
    for (const table of USER_TABLES) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);
      if (error) throw error;
    }
    const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
    if (profileError) throw profileError;

    // 4. The auth identity itself.
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return json({ ok: true });
  } catch (error) {
    console.error("[delete-account] failed:", error);
    return json({ error: "We couldn't delete your account right now. Please try again." }, 500);
  }
});
