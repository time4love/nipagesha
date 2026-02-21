"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAccount } from "./actions";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה");
        setIsDeleting(false);
        return;
      }
      setOpen(false);
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("החשבון נמחק בהצלחה.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("אירעה שגיאה במחיקת החשבון.");
      setIsDeleting(false);
    }
  }

  return (
    <section
      className="rounded-lg border-2 border-destructive/50 bg-destructive/5 p-4 sm:p-6"
      aria-labelledby="danger-zone-title"
      dir="rtl"
    >
      <h2
        id="danger-zone-title"
        className="text-lg font-semibold text-destructive mb-2"
      >
        מחיקת חשבון
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        פעולה זו היא בלתי הפיכה. כל המידע שלך, כולל כרטיסי הילדים והמסרים,
        יימחק לצמיתות.
      </p>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDeleting}>
            מחק את החשבון שלי
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-lg" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם את/ה בטוח/ה?</AlertDialogTitle>
            <AlertDialogDescription>
              לא ניתן לשחזר את המידע לאחר המחיקה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin ms-2" aria-hidden />
                  מוחק…
                </>
              ) : (
                "כן, מחק הכל"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
