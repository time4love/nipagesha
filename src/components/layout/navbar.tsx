import { unstable_noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  unstable_noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <NavbarClient user={user} />;
}
