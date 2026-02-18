"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { deleteSong } from "./actions";

interface DeleteSongButtonProps {
  songId: string;
  songTitle: string;
}

export function DeleteSongButton({ songId, songTitle }: DeleteSongButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const { error } = await deleteSong(songId);
    setLoading(false);
    if (error) {
      alert(error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="מחיקה"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>מחיקת שיר</DialogTitle>
          <DialogDescription>
            האם למחוק את השיר &quot;{songTitle}&quot;? פעולה זו לא ניתנת לביטול.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            ביטול
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "מוחק..." : "מחק"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
