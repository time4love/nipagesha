"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChildCardRow, ChildReplyRow, CardAccessLogRow } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, MessageSquare } from "lucide-react";
import { CardActivityLog } from "./CardActivityLog";
import { markAllRepliesAsReadForCard } from "@/app/message/actions";

function formatReplyDate(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export interface DashboardCardProps {
  card: ChildCardRow;
  replies: ChildReplyRow[];
  logs: CardAccessLogRow[];
  failureDaysAgo: Date;
}

export function DashboardCard({
  card,
  replies,
  logs,
  failureDaysAgo,
}: DashboardCardProps) {
  const [open, setOpen] = useState(false);
  const [repliesState, setRepliesState] = useState(replies);
  const unreadCount = repliesState.filter((r) => !r.is_read).length;

  const lastSuccess = logs.find((l) => l.attempt_type === "success");
  const lastReadAt = lastSuccess ? new Date(lastSuccess.created_at) : null;
  const failureCount7d = logs.filter(
    (l) => l.attempt_type === "failure" && new Date(l.created_at) >= failureDaysAgo
  ).length;
  const failureCountAll = logs.filter((l) => l.attempt_type === "failure").length;

  async function handleMarkAllRead() {
    const { error } = await markAllRepliesAsReadForCard(card.id);
    if (!error) {
      setRepliesState((prev) => prev.map((r) => ({ ...r, is_read: true })));
    }
  }

  const sortedReplies = [...repliesState].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card className="border-teal-100 dark:border-teal-900/50 relative">
      {unreadCount > 0 && (
        <span
          className="absolute top-2 left-2 rtl:left-auto rtl:right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-amber-950"
          aria-label={`${unreadCount} הודעות חדשות`}
        >
          הודעה חדשה!
        </span>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {card.child_first_name} {card.child_last_name}
        </CardTitle>
        <CardDescription>
          שנת לידה: {card.birth_year} • שאלת אבטחה מוגדרת
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          ההודעה מוצפנת ומוגנת. רק הילד יוכל לפתוח אותה עם תשובת האבטחה.
        </p>
        <CardActivityLog
          lastReadAt={lastReadAt}
          failureCount7d={failureCount7d}
          failureCountAll={failureCountAll}
        />
        <div className="flex flex-wrap gap-2">
          {repliesState.length > 0 && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-1"
                  aria-label="צפה בתגובות הילד"
                >
                  <MessageSquare className="size-4" aria-hidden />
                  צפה בתגובות
                  {unreadCount > 0 && (
                    <span className="mr-1 rtl:ml-1 rounded-full bg-amber-500 text-amber-950 text-xs px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col" dir="rtl">
                <DialogHeader>
                  <DialogTitle>תגובות מ{card.child_first_name}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto space-y-4 pr-2">
                  {sortedReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-lg border p-3 text-right ${
                        reply.is_read
                          ? "border-border bg-muted/30"
                          : "border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/30"
                      }`}
                    >
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {reply.content}
                      </p>
                      {reply.contact_info && (
                        <p className="text-xs text-muted-foreground mt-2">
                          פרטי התקשרות: {reply.contact_info}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatReplyDate(reply.created_at)}
                        {!reply.is_read && (
                          <span className="mr-2 text-amber-600 dark:text-amber-400">
                            • חדש
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <div className="pt-2 border-t">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={handleMarkAllRead}
                    >
                      סמן הכל כנקרא
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/view/${card.id}`}>צפה במסר</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/edit-card/${card.id}`} aria-label="ערוך כרטיס">
              <Pencil className="size-4 ml-1 rtl:ml-0 rtl:mr-1" aria-hidden />
              ערוך
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
