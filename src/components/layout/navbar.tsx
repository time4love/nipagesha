import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = isAdmin(user?.email ?? undefined);

  return <NavbarClient user={user} isAdmin={admin} />;
}
