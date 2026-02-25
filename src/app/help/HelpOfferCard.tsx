"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { getHelpCategoryBadgeVariant } from "@/lib/constants";
import type { HelpOfferWithOfferer } from "./actions";
import { ContactOffererDialog } from "./ContactOffererDialog";

interface HelpOfferCardProps {
  offer: HelpOfferWithOfferer;
  /** When set (logged-in user), contact dialog can pre-fill seeker details. */
  seekerDisplayName?: string;
  seekerEmail?: string;
}

export function HelpOfferCard({
  offer,
  seekerDisplayName,
  seekerEmail,
}: HelpOfferCardProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const displayName = offer.offerer_display_name ?? "מתנדב/ת";
  const avatarUrl = offer.offerer_avatar_url ?? null;
  const bio = offer.offerer_bio ?? null;
  const initial = displayName.charAt(0);

  return (
    <>
      <Card className="flex flex-col h-full border-teal-100 dark:border-teal-900/50 hover:shadow-md transition-shadow" dir="rtl">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={getHelpCategoryBadgeVariant(offer.category)}>
              {offer.category}
            </Badge>
            {offer.location ? (
              <span className="text-sm text-muted-foreground">📍 {offer.location}</span>
            ) : null}
          </div>
          <CardTitle className="text-lg leading-tight">{offer.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {offer.description}
          </p>
          <div className="mt-3 flex items-start gap-2">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="text-sm">{initial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              {bio ? (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {bio}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            type="button"
            variant="outline"
            className="w-full border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
            onClick={() => setContactOpen(true)}
            aria-label={`צור קשר – ${offer.title}`}
          >
            <Mail className="size-4 ml-2" aria-hidden />
            צור קשר
          </Button>
        </CardFooter>
      </Card>
      <ContactOffererDialog
        offer={offer}
        open={contactOpen}
        onOpenChange={setContactOpen}
        defaultName={seekerDisplayName}
        defaultEmail={seekerEmail}
      />
    </>
  );
}
