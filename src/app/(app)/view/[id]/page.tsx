import { notFound } from "next/navigation";
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

  const childName = [card.child_first_name, card.child_last_name].filter(Boolean).join(" ");

  return (
    <RevealMessageClient
      securityQuestion={card.security_question}
      encryptedMessage={card.encrypted_message}
      childName={childName}
    />
  );
}
