import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
  "data-testid"?: string;
}

export function ErrorMessage({
  message,
  className,
  "data-testid": testId,
}: ErrorMessageProps) {
  return (
    <p
      className={cn(
        "text-sm text-destructive bg-destructive/10 rounded-md p-3",
        className
      )}
      role="alert"
      data-testid={testId}
    >
      {message}
    </p>
  );
}
