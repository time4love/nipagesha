import { notFound } from "next/navigation";
import { getCardForEdit } from "@/app/(app)/create-card/actions";
import { EditCardClient } from "./EditCardClient";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCardForEdit(id);
  if (!card) notFound();

  return <EditCardClient card={card} />;
}
