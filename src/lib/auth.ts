import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Returns the authenticated Supabase user id, or redirects to /login. */
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}
