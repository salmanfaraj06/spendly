import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "./supabase/server";
import { USER_ID_HEADER } from "./auth-headers";

/** Returns the authenticated Supabase user id, or redirects to /login. */
export async function requireUserId(): Promise<string> {
  const requestHeaders = await headers();
  const verifiedUserId = requestHeaders.get(USER_ID_HEADER);
  if (verifiedUserId) return verifiedUserId;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}
