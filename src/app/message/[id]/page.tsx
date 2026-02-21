import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import type { MessagePageCard } from "@/lib/supabase/types";
import { CHILD_PAGE_GRADIENT } from "@/lib/constants";
import { MessageUnlockClient } from "./MessageUnlockClient";

/** Label shown to child for reply CTA: אבא, אמא, or אבא/אמא when not set (ניכור הורי). */
function getParentReplyLabel(parentRole: string | null): string {
  if (parentRole === "dad") return "אבא";
  if (parentRole === "mom") return "אמא";
  return "אבא/אמא";
}

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: cardRow, error } = await supabase
    .from("child_cards")
    .select("id, user_id, child_first_name, child_last_name, sender_name, security_question, encrypted_message")
    .eq("id", id)
    .single();

  if (error || !cardRow) {
    notFound();
  }

  const card: MessagePageCard = {
    id: cardRow.id,
    child_first_name: cardRow.child_first_name,
    child_last_name: cardRow.child_last_name,
    sender_name: cardRow.sender_name,
    security_question: cardRow.security_question,
    encrypted_message: cardRow.encrypted_message,
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("parent_role")
    .eq("id", cardRow.user_id)
    .single();

  const parentReplyLabel = getParentReplyLabel(profile?.parent_role ?? null);

  return (
    <div className="min-h-screen" dir="rtl">
      <div className={CHILD_PAGE_GRADIENT} aria-hidden />
      <MessageUnlockClient card={card} parentReplyLabel={parentReplyLabel} />
    </div>
  );
}
