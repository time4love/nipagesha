# Code Review: Clean Code Standards

Review date: 2025. Aligned with `.cursorrules` (SOLID, DRY, KISS, TypeScript strict, no `any`, privacy-first).

---

## Summary of Applied Fixes

| Area | Issue | Fix |
|------|--------|-----|
| **create-card/page.tsx** | Unused `useRouter()` import and variable | Removed. |
| **create-card/actions.ts** | Inline payload type; duplication with DB type | Use `ChildCardInsert` and `CreateChildCardPayload` (Omit user_id); single `row` then insert. |
| **auth/actions.ts** | Duplicated form parsing and Hebrew strings | `parseAuthFormData()` + `AUTH_ERRORS` constants. |
| **lib/crypto/index.ts** | Incorrect JSDoc (encrypt said "salt \| iv \| ciphertext") | Corrected to "iv \| ciphertext". |
| **lib/supabase/server.ts** | Env loading mixed with client creation | Moved to `lib/env.ts`: `getSupabaseEnv()` with dev .env.local fallback. |
| **Login + Create-card** | Duplicated error message markup | Shared `ErrorMessage` component. |

---

## Clean Code Checklist

### SOLID
- **S (Single Responsibility):** Auth actions only auth; create-card action only insert; env in `lib/env.ts`; crypto in `lib/crypto`.
- **O (Open/Closed):** UI extended via Shadcn components; no change needed for new form fields beyond schema + fields.
- **L (Liskov):** N/A at current scale.
- **I (Interface Segregation):** `CreateChildCardPayload` is minimal (no `user_id`); `AuthActionResult` is a small result type.
- **D (Dependency Inversion):** Server uses `createClient()` from `@/lib/supabase/server`; no direct Supabase instantiation in pages.

### DRY
- Auth: one `parseAuthFormData`, shared `AUTH_ERRORS`.
- Error UI: single `ErrorMessage` for login and create-card.
- Env: one `getSupabaseEnv()` used by server Supabase client.
- Types: `ChildCardInsert` / `ChildCardRow` reused in dashboard and create-card action.

### KISS
- No unnecessary abstractions; server actions are thin.
- Crypto API is straightforward (derive key → encrypt/decrypt with clear formats).

### Typing
- No `any`; `FormData.get()` cast to `string | null` then narrowed.
- Zod + `z.infer` for create-card form; Supabase types via `ChildCardRow` / `ChildCardInsert`.

### Privacy & Security
- Raw message and security answer never sent to server; encryption is client-side only.
- No logging of credentials or message content; only generic error messages in auth.
- RLS assumed on `child_cards` (migration enforces per-user access).

### Error Handling
- Try/catch in create-card submit with user-facing Hebrew message.
- Auth actions return `{ error }` or redirect; Supabase errors mapped to safe messages where appropriate.
- `getSupabaseEnv()` throws with a clear message if env is missing.

### Accessibility & i18n
- `role="alert"` on error messages; `aria-required` and labels on forms.
- Hebrew copy in UI; code/comments in English.

---

## Recommendations (Optional)

1. **Dashboard error state:** On `child_cards` fetch error, show a small inline message or retry instead of only `console.error`.
2. **Auth:** Consider rate limiting or CAPTCHA on login/signup (handled later in Supabase or edge).
3. **Create-card schema:** Child identification uses `birth_date` (full date); year range for the DOB picker is 1990–current year.
4. **Tests:** Add unit tests for `parseAuthFormData`, `encryptMessage`/`decryptMessage` round-trip, and `getSupabaseEnv` (e.g. mock `process.env` and fs).

---

## File Structure (Relevant)

```
src/
  app/
    auth/actions.ts      # login, signup (DRY form parse + constants)
    login/page.tsx       # form + ErrorMessage
    (app)/
      dashboard/page.tsx # protected; list child_cards
      create-card/
        page.tsx        # form; client encrypt then action
        actions.ts      # createChildCard (typed with ChildCardInsert)
  lib/
    env.ts              # getSupabaseEnv (single place for env)
    crypto/index.ts     # encryptMessage / decryptMessage (correct JSDoc)
    supabase/
      server.ts         # createClient (uses getSupabaseEnv)
      client.ts
      types.ts          # ChildCardRow, ChildCardInsert
  components/
    ui/error-message.tsx # shared error alert
```

All of the above is consistent with Clean Code and the project’s existing rules.
