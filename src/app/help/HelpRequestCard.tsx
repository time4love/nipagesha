"use client";

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
import { HandHeart } from "lucide-react";
import type { HelpRequestWithRequester } from "./actions";

interface HelpRequestCardProps {
  request: HelpRequestWithRequester;
  onOfferHelp: (request: HelpRequestWithRequester) => void;
  /** When true, the "אני רוצה לעזור" button is hidden (own request). */
  isOwnRequest?: boolean;
}

export function HelpRequestCard({ request, onOfferHelp, isOwnRequest }: HelpRequestCardProps) {
  const displayName = request.requester_display_name ?? "הורה אנונימי";
  const avatarUrl = request.requester_avatar_url ?? null;
  const initial = displayName.charAt(0);

  return (
    <Card className="flex flex-col h-full border-teal-100 dark:border-teal-900/50 hover:shadow-md transition-shadow" dir="rtl">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge variant="success">{request.category}</Badge>
          {request.location ? (
            <span className="text-sm text-muted-foreground">📍 {request.location}</span>
          ) : null}
        </div>
        <CardTitle className="text-lg leading-tight">{request.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {request.description}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{displayName}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {!isOwnRequest && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
            onClick={() => onOfferHelp(request)}
            aria-label={`אני רוצה לעזור – ${request.title}`}
          >
            <HandHeart className="size-4 ml-2" aria-hidden />
            אני רוצה לעזור
          </Button>
        )}
        {isOwnRequest && (
          <p className="text-sm text-muted-foreground w-full text-center py-1">
            זו הבקשה שלכם – ניהול מהדף &quot;הבקשות שלי&quot;
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
