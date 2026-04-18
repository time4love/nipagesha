"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateForumComment } from "@/app/forum/actions";
import { toast } from "sonner";

interface ForumCommentEditDialogProps {
  commentId: string;
  postId: string;
  initialContent: string;
}

export function ForumCommentEditDialog({
  commentId,
  postId,
  initialContent,
}: ForumCommentEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialContent);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initialContent);
      setError(null);
    }
  }, [open, initialContent]);

  async function handleSave() {
    setError(null);
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("נא לכתוב תוכן לתגובה.");
      return;
    }
    setPending(true);
    const res = await updateForumComment(commentId, postId, trimmed);
    setPending(false);
    if (!res.success) {
      toast.error(res.error ?? "לא ניתן לעדכן את התגובה.");
      return;
    }
    toast.success("התגובה עודכנה.");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="ערוך תגובה"
        title="ערוך תגובה"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg" showClose>
        <DialogHeader>
          <DialogTitle>עריכת תגובה</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={pending}
            rows={5}
            className="min-h-[120px] resize-y"
            aria-label="תוכן התגובה"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            ביטול
          </Button>
          <Button
            type="button"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={pending || !draft.trim()}
            onClick={() => void handleSave()}
          >
            {pending ? "שומר..." : "שמור"}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}
