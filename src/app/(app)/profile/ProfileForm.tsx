"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, type UpdateProfileResult } from "./actions";
import type { ProfileRow } from "@/lib/supabase/types";

const PRIVACY_OPTIONS: { value: ProfileRow["privacy_level"]; label: string }[] = [
  { value: "registered_only", label: "רק למשתמשים רשומים" },
  { value: "public", label: "כל הגולשים" },
];

const PARENT_ROLE_OPTIONS: { value: "dad" | "mom"; label: string }[] = [
  { value: "dad", label: "אבא" },
  { value: "mom", label: "אמא" },
];

interface ProfileFormProps {
  profile: ProfileRow;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isAnonymous, setIsAnonymous] = useState(profile.is_anonymous);
  const [state, formAction] = useActionState(
    async (_prev: UpdateProfileResult, formData: FormData) => {
      return updateProfile(formData);
    },
    { success: true }
  );

  const displayInitial = profile.display_name?.trim() || "";
  const initialLetter = displayInitial
    ? displayInitial.charAt(0).toUpperCase()
    : "?";

  return (
    <form action={formAction} className="space-y-6" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="display_name">שם לתצוגה</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayInitial}
          placeholder="שם או כינוי"
          className="max-w-md"
          aria-describedby="display_name_desc"
        />
        <p id="display_name_desc" className="text-sm text-muted-foreground">
          יוצג בלוח העזרה אם תבחרו לא להופיע כאנונימיים.
        </p>
      </div>

      <div className="space-y-2">
        <Label>תמונת פרופיל</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-lg">{initialLetter}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              className="max-w-xs"
              aria-label="העלאת תמונת פרופיל"
            />
            <p className="text-sm text-muted-foreground">
              JPG, PNG או GIF. השאירו ריק כדי להשאיר את התמונה הנוכחית.
            </p>
          </div>
        </div>
      </div>

      <input type="hidden" name="is_anonymous" value={isAnonymous ? "true" : "false"} />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch
            id="is_anonymous"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
            aria-describedby="is_anonymous_desc"
          />
          <Label htmlFor="is_anonymous">הצג אותי כאנונימי (הורה אנונימי)</Label>
        </div>
        <p id="is_anonymous_desc" className="text-sm text-muted-foreground">
          כשמופעל, יוצג &quot;הורה אנונימי&quot; במקום השם והתמונה.
        </p>
      </div>

      <div className="space-y-2">
        <Label>מי יכול לראות את השם והתמונה שלי?</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {PRIVACY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy_level"
                value={opt.value}
                defaultChecked={profile.privacy_level === opt.value}
                className="rounded-full border-input"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>אני</Label>
        <p id="parent_role_desc" className="text-sm text-muted-foreground mb-1">
          כשהילד יפתח את המסר וירצה לשלוח תגובה, הוא יראה &quot;שלח תגובה לאמא&quot; או &quot;שלח תגובה לאבא&quot; — לפי הבחירה כאן.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {PARENT_ROLE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parent_role"
                value={opt.value}
                defaultChecked={profile.parent_role === opt.value}
                className="rounded-full border-input"
                aria-describedby="parent_role_desc"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="parent_role"
              value=""
              defaultChecked={profile.parent_role === null || profile.parent_role === undefined}
              className="rounded-full border-input"
            />
            <span className="text-sm">לא לציין</span>
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && !state?.error && (
        <p className="text-sm text-teal-600 dark:text-teal-400" role="status">
          הפרופיל נשמר בהצלחה.
        </p>
      )}

      <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
        שמור שינויים
      </Button>
    </form>
  );
}
