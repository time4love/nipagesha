import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import type { MessagePageCard } from "@/lib/supabase/types";
import { CHILD_PAGE_GRADIENT } from "@/lib/constants";
import { MessageUnlockClient } from "./MessageUnlockClient";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("child_cards")
    .select("id, child_first_name, child_last_name, security_question, encrypted_message")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const card: MessagePageCard = {
    id: data.id,
    child_first_name: data.child_first_name,
    child_last_name: data.child_last_name,
    security_question: data.security_question,
    encrypted_message: data.encrypted_message,
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <div className={CHILD_PAGE_GRADIENT} aria-hidden />
      <MessageUnlockClient card={card} />
    </div>
  );
}
