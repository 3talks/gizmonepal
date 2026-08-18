import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bootstrap the very first admin: if no admin row exists yet, the signed-in
 * caller becomes the admin. Once an admin exists this is a no-op for everyone
 * else, so it cannot be used for privilege escalation.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: admins, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (error) throw error;

    if ((admins ?? []).some((row) => row.user_id === context.userId)) {
      return { ok: true, alreadyAdmin: true } as const;
    }

    if ((admins ?? []).length > 0) {
      throw new Error(
        "An admin account already exists. Ask the existing admin to grant you access.",
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insertError) throw insertError;

    return { ok: true, alreadyAdmin: false } as const;
  });
