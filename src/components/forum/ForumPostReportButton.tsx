"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { ReportDialog } from "@/components/common/ReportDialog";

interface ForumPostReportButtonProps {
  postId: string;
  postTitle: string;
  initialEmail?: string;
  initialName?: string;
}

export function ForumPostReportButton({
  postId,
  postTitle,
  initialEmail,
  initialName,
}: ForumPostReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md p-1.5 -m-1.5"
        aria-label={`דיווח על הפוסט: ${postTitle}`}
      >
        <Flag className="size-4 shrink-0" aria-hidden />
        דיווח
      </button>
      <ReportDialog
        open={open}
        onOpenChange={setOpen}
        referenceId={postId}
        referenceType="forum_post"
        contentTitle={postTitle}
        initialEmail={initialEmail}
        initialName={initialName}
      />
    </>
  );
}
