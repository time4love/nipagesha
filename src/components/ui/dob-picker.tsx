"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Hebrew month names (1 = January). */
const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_MIN = 1990;
const YEARS = Array.from(
  { length: CURRENT_YEAR - YEAR_MIN + 1 },
  (_, i) => CURRENT_YEAR - i
);

const DAYS_IN_MONTH = (year: number, month: number): number =>
  new Date(year, month, 0).getDate();

/** Returns a Date at UTC noon to avoid timezone shifts when serializing to date-only. */
export function toUtcNoonDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/** Returns ISO date string YYYY-MM-DD from a Date (using UTC to avoid shift). */
export function toIsoDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface DateOfBirthPickerProps {
  /** Current value: Date or ISO string YYYY-MM-DD. */
  value: Date | string | null;
  /** Called with a Date (UTC noon) or ISO string when the user changes the selection. */
  onChange: (value: Date | null) => void;
  /** Optional label above the row of selects. */
  label?: string;
  /** Optional id for the label. */
  id?: string;
  className?: string;
  /** Placeholders when nothing selected. */
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
  disabled?: boolean;
}

function parseValue(value: Date | string | null): {
  day: number;
  month: number;
  year: number;
} | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value + "T12:00:00.000Z") : value;
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth() + 1,
    year: d.getUTCFullYear(),
  };
}

export function DateOfBirthPicker({
  value,
  onChange,
  label,
  id,
  className,
  dayPlaceholder = "יום",
  monthPlaceholder = "חודש",
  yearPlaceholder = "שנה",
  disabled = false,
}: DateOfBirthPickerProps) {
  const parsed = parseValue(value);
  const [day, setDay] = React.useState<number | null>(parsed?.day ?? null);
  const [month, setMonth] = React.useState<number | null>(parsed?.month ?? null);
  const [year, setYear] = React.useState<number | null>(parsed?.year ?? null);

  // Sync from controlled value when it changes (e.g. edit form load).
  React.useEffect(() => {
    const p = parseValue(value);
    if (p) {
      setDay(p.day);
      setMonth(p.month);
      setYear(p.year);
    } else {
      setDay(null);
      setMonth(null);
      setYear(null);
    }
  }, [value]);

  const lastYear = year ?? CURRENT_YEAR;
  const lastMonth = month ?? 1;
  const daysInCurrentMonth = DAYS_IN_MONTH(lastYear, lastMonth);
  const dayOptions = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const notifyChange = React.useCallback(
    (d: number | null, m: number | null, y: number | null) => {
      if (d != null && m != null && y != null) {
        const date = toUtcNoonDate(y, m, d);
        onChange(date);
      } else {
        onChange(null);
      }
    },
    [onChange]
  );

  const handleDay = (v: string) => {
    const num = parseInt(v, 10);
    setDay(num);
    notifyChange(num, month, year);
  };
  const handleMonth = (v: string) => {
    const num = parseInt(v, 10);
    setMonth(num);
    notifyChange(day, num, year);
  };
  const handleYear = (v: string) => {
    const num = parseInt(v, 10);
    setYear(num);
    notifyChange(day, month, num);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} dir="rtl">
      {label && (
        <label
          id={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={day != null ? String(day) : ""}
          onValueChange={handleDay}
          disabled={disabled}
        >
          <SelectTrigger
            id={id ? `${id}-day` : undefined}
            className="text-right"
            aria-label={dayPlaceholder}
          >
            <SelectValue placeholder={dayPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {dayOptions.map((d) => (
              <SelectItem key={d} value={String(d)} className="text-right">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={month != null ? String(month) : ""}
          onValueChange={handleMonth}
          disabled={disabled}
        >
          <SelectTrigger className="text-right" aria-label={monthPlaceholder}>
            <SelectValue placeholder={monthPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {HEBREW_MONTHS.map((name, i) => (
              <SelectItem
                key={i}
                value={String(i + 1)}
                className="text-right"
              >
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={year != null ? String(year) : ""}
          onValueChange={handleYear}
          disabled={disabled}
        >
          <SelectTrigger className="text-right" aria-label={yearPlaceholder}>
            <SelectValue placeholder={yearPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)} className="text-right">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
