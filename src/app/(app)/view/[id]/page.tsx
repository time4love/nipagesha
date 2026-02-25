import { notFound } from "next/navigation";
import { formatChildName } from "@/lib/child-card";
import { getCardForReveal } from "../actions";
import { RevealMessageClient } from "./RevealMessageClient";

export default async function ViewCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCardForReveal(id);
  if (!card) notFound();

  const childName = formatChildName(card.child_first_name);

  return (
    <RevealMessageClient
      securityQuestion={card.security_question}
      encryptedMessage={card.encrypted_message}
      childName={childName}
    />
  );
}
