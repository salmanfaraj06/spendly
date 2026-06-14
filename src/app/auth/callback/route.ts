import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Exchanges the OAuth code for a session, then provisions the User row. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Lazily provision domain data on first login.
        const { ensureUserProvisioned } = await import("@/lib/provision");
        const fullName =
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined);
        await ensureUserProvisioned(user.id, user.email ?? "", fullName);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
