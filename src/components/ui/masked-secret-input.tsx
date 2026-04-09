"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MaskedSecretInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>;

/**
 * Visually masks input like a password field but uses type="text" so mobile OSes
 * offer the Hebrew (or default locale) keyboard instead of forcing ASCII on password fields.
 * Uses WebKit/Blink text-security; other engines may show characters — unlock is still client-side only.
 */
export const MaskedSecretInput = React.forwardRef<
  HTMLInputElement,
  MaskedSecretInputProps
>(function MaskedSecretInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      type="text"
      inputMode="text"
      lang="he"
      dir="rtl"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      className={cn(
        "[-webkit-text-security:disc] [text-security:disc]",
        className
      )}
      {...props}
    />
  );
});

MaskedSecretInput.displayName = "MaskedSecretInput";
