"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ISRAEL_CITIES } from "@/lib/israel-cities";

export interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Optional: when set, a hidden input with this name is rendered for form submit */
  name?: string;
  /** Optional: allow clearing the selection */
  clearable?: boolean;
  id?: string;
  className?: string;
  /** Label above the combobox (default: "בחר עיר או אזור") */
  label?: string;
  placeholder?: string;
}

export function CitySelect({
  value,
  onChange,
  name,
  clearable = false,
  id,
  className,
  label = "בחר עיר או אזור",
  placeholder = "בחר עיר או אזור",
}: CitySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = ISRAEL_CITIES.find((c) => c.value === value);
  const displayValue = selectedOption?.label ?? value;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {name ? (
        <input type="hidden" name={name} value={value} readOnly aria-hidden />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            id={id}
            role="combobox"
            tabIndex={0}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={placeholder}
            className={cn(
              "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm font-normal shadow-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !displayValue && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {clearable && value ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange("");
                    }
                  }}
                  className="rounded p-0.5 hover:bg-accent cursor-pointer"
                  aria-label="נקה בחירה"
                >
                  <X className="h-4 w-4" />
                </span>
              ) : null}
              <ChevronsUpDown className="h-4 w-4 opacity-50" aria-hidden />
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command dir="rtl">
            <CommandInput placeholder="חפש עיר או אזור..." />
            <CommandList>
              <CommandEmpty>לא נמצאו תוצאות.</CommandEmpty>
              <CommandGroup>
                {ISRAEL_CITIES.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
