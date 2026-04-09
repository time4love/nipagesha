import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import type { MessagePageCard } from "@/lib/supabase/types";
import { CHILD_PAGE_GRADIENT } from "@/lib/constants";
import { MessageUnlockClient } from "./MessageUnlockClient";

/** Generic OG copy only — never include the child's name (scrapers/cache). */
const MESSAGE_PAGE_TITLE = "מחכה לך מסר אישי 💌";
const MESSAGE_PAGE_DESCRIPTION =
  "מישהו השאיר עבורך הודעה מאובטחת. היכנס/י כדי לגלות ממי זה ולפתוח את המסר.";

export const metadata: Metadata = {
  title: MESSAGE_PAGE_TITLE,
  description: MESSAGE_PAGE_DESCRIPTION,
  openGraph: {
    title: MESSAGE_PAGE_TITLE,
    description: MESSAGE_PAGE_DESCRIPTION,
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: MESSAGE_PAGE_TITLE,
    description: MESSAGE_PAGE_DESCRIPTION,
  },
};

/** Label shown to child for reply CTA. Sender identity is per-card; no global parent_role. */
const PARENT_REPLY_LABEL = "אבא/אמא";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: cardRow, error } = await supabase
    .from("child_cards")
    .select("id, user_id, child_first_name, security_question, encrypted_message")
    .eq("id", id)
    .single();

  if (error || !cardRow) {
    notFound();
  }

  const card: MessagePageCard = {
    id: cardRow.id,
    child_first_name: cardRow.child_first_name,
    security_question: cardRow.security_question,
    encrypted_message: cardRow.encrypted_message,
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <div className={CHILD_PAGE_GRADIENT} aria-hidden />
      <MessageUnlockClient card={card} parentReplyLabel={PARENT_REPLY_LABEL} />
    </div>
  );
}
