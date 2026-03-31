"use client";

import { ForumPostForm } from "@/components/forum/ForumPostForm";

export function ForumNewPostForm() {
  return (
    <ForumPostForm
      mode="create"
      backHref="/forum"
      backLabel="חזרה לפורום"
    />
  );
}
