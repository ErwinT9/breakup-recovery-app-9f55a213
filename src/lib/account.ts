import { supabase } from "@/integrations/supabase/client";

/**
 * Permanently deletes the signed-in user via the `delete-account` Edge Function:
 * every owned row, their storage objects, and finally the auth identity.
 * Runs against the Supabase project directly so it works identically in the
 * Lovable preview, on the web, and inside the Capacitor Android APK (where
 * bundled assets have no app server to host server functions).
 */
export async function deleteMyAccount(): Promise<{ ok: true }> {
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>(
    "delete-account",
    { method: "POST" },
  );

  if (error || !data?.ok) {
    throw new Error(
      data?.error ??
        "We couldn't delete your account right now. Please try again in a moment or contact support.",
    );
  }

  return { ok: true };
}
