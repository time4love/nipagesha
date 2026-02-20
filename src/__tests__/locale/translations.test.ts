/**
 * Verifies that all English translation keys exist in every other locale.
 * Run with: npm run test
 */

import { describe, test, expect } from "vitest";
import en from "@/assets/locale/messages_en.json";
import he from "@/assets/locale/messages_he.json";
import lt from "@/assets/locale/messages_lt.json";
import uk from "@/assets/locale/messages_uk.json";

const translationKeys = Object.keys(en as Record<string, string>);

const locales = [
  { name: "Hebrew", messages: he as Record<string, string> },
  { name: "Lithuanian", messages: lt as Record<string, string> },
  { name: "Ukrainian", messages: uk as Record<string, string> },
];

describe("Translation keys", () => {
  locales.forEach(({ name, messages }) => {
    translationKeys.forEach((key) => {
      test(`Key "${key}" exists in ${name}`, () => {
        expect(messages).toHaveProperty(key);
      });
    });
  });
});
