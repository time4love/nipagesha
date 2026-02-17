import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { MessageUnlockClient } from "./MessageUnlockClient";

export type MessagePageCard = {
  id: string;
  child_first_name: string;
  child_last_name: string;
  security_question: string;
  encrypted_message: string;
};

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
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-background dark:from-amber-950/20 dark:via-orange-950/10 dark:to-background"
        aria-hidden
      />
      <MessageUnlockClient card={card} />
    </div>
  );
}
