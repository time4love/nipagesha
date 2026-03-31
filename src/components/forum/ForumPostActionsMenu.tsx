"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteForumPost } from "@/app/forum/actions";
import { cn } from "@/lib/utils";

interface ForumPostActionsMenuProps {
  postId: string;
  postTitle: string;
  /** e.g. card uses icon ghost; page can use outline */
  triggerClassName?: string;
}

export function ForumPostActionsMenu({
  postId,
  postTitle,
  triggerClassName,
}: ForumPostActionsMenuProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    setDeleting(true);
    const res = await deleteForumPost(postId);
    setDeleting(false);
    if (!res.success) {
      setDeleteOpen(false);
      return;
    }
    setDeleteOpen(false);
    router.push("/forum");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground",
              triggerClassName
            )}
            aria-label={`פעולות: ${postTitle}`}
          >
            <MoreVertical className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 text-right">
          <DropdownMenuItem asChild>
            <Link href={`/forum/${postId}/edit`} className="cursor-pointer">
              <Pencil className="size-4" aria-hidden />
              ערוך פוסט
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            מחק פוסט
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת פוסט</AlertDialogTitle>
            <AlertDialogDescription>
              האם את/ה בטוח/ה? פעולה זו תמחק את הפוסט ואת כל התגובות שלו לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>ביטול</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDeleteConfirm()}
            >
              {deleting ? "מוחק..." : "כן, מחק"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
