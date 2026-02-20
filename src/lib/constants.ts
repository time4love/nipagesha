/**
 * Shared UI constants (classes, copy) for consistency.
 */

/** Outline button style for primary CTAs (light background, teal border/text). */
export const OUTLINE_BUTTON_TEAL_CLASS =
  "bg-white border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700";

/** Background gradient for child-facing pages (search, message unlock). */
export const CHILD_PAGE_GRADIENT =
  "absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-background dark:from-amber-950/20 dark:via-orange-950/10 dark:to-background";

/** Help Board categories (Hebrew). Used for form dropdown and filter. */
export const HELP_CATEGORIES = [
  "סיוע משפטי/בירוקרטי",
  "לוגיסטיקה ומסירת מתנות",
  "תמיכה רגשית והקשבה",
  "הפצת מידע ומודעות",
  "יצירה, עריכה ואמנות",
  "אירוח וחגים",
  "אחר",
] as const;

export type HelpCategory = (typeof HELP_CATEGORIES)[number];

/** Badge variant per category for consistent styling on the Help Board. */
const HELP_CATEGORY_VARIANTS: Record<
  HelpCategory,
  "default" | "secondary" | "success" | "outline"
> = {
  "סיוע משפטי/בירוקרטי": "default",
  "לוגיסטיקה ומסירת מתנות": "success",
  "תמיכה רגשית והקשבה": "secondary",
  "הפצת מידע ומודעות": "default",
  "יצירה, עריכה ואמנות": "secondary",
  "אירוח וחגים": "success",
  אחר: "outline",
};

export function getHelpCategoryBadgeVariant(
  category: string
): "default" | "secondary" | "success" | "outline" {
  return HELP_CATEGORY_VARIANTS[category as HelpCategory] ?? "outline";
}
