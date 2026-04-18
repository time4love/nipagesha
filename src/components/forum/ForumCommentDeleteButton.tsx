"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteForumComment } from "@/app/forum/actions";
import { toast } from "sonner";

interface ForumCommentDeleteButtonProps {
  commentId: string;
  postId: string;
  /** Admin deleting someone else's comment — copy reflects moderation. */
  moderation?: boolean;
}

export function ForumCommentDeleteButton({
  commentId,
  postId,
  moderation,
}: ForumCommentDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const res = await deleteForumComment(commentId, postId);
    setPending(false);
    if (!res.success) {
      toast.error(res.error ?? "לא ניתן למחוק את התגובה.");
      return;
    }
    toast.success(moderation ? "התגובה נמחקה (ניהול)." : "התגובה נמחקה.");
    setOpen(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={moderation ? "מחק תגובה כמנהל" : "מחק תגובה"}
          title={moderation ? "מחק תגובה (ניהול)" : "מחק תגובה"}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {moderation ? "מחיקת תגובה (ניהול)" : "מחיקת תגובה"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {moderation
              ? "למחוק תגובה זו כמנהל? לא ניתן לשחזר אותה."
              : "למחוק את התגובה שלך? לא ניתן לשחזר אותה."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>ביטול</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void handleDelete()}
          >
            {pending ? "מוחק..." : "מחק"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
