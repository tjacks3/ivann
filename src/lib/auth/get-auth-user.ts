import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Get the authenticated Supabase user. Redirects to /login if not authenticated.
 * Use in server actions and server components.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
