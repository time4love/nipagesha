# Validation Errors – Copy for UX Writer

Use these descriptions to write user-facing error messages and create the corresponding translation keys. Each key is already defined in `assets/locale/messages_*.json`; you only need to supply the final copy per language.

---

## Create Card / Edit Card form

### Child first name (`child_first_name`)
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validation.childFirstName.required` | User leaves the field empty or submits only whitespace. | The child’s first name is required. Ask the user to enter the child’s first name. |

*Optional future validations (not implemented yet): max length, disallow only numbers/symbols if you want “name-like” input.*

---

### Child last name (`child_last_name`)
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validation.childLastName.required` | User leaves the field empty or submits only whitespace. | The child’s last name is required. Ask the user to enter the child’s last name. |

*Optional future: same as first name (max length, format).*

---

### Birth year (`birth_year`)
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validation.birthYear.required` | No year is selected (e.g. placeholder “Select year” still selected). | User must choose a birth year. |
| `validation.birthYear.range` | The selected year is outside the allowed range (e.g. before 1950 or after the current year). | Birth year must be within the allowed range (e.g. 1950–current year). Use `{{min}}` and `{{max}}` in the string for the actual bounds. |

---

### Security question (`security_question`)
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validation.securityQuestion.required` | User leaves the field empty or submits only whitespace. | A security question is required so only the child can unlock the message. Ask the user to enter a question only the child knows the answer to. |

---

### Security answer (`security_answer`)
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validation.securityAnswer.required` | User leaves the field empty or submits only whitespace. | The security answer is required; it is used as the encryption key. Ask the user to enter the answer (and remind them not to share it). |

*Optional future: minimum length if you add such a rule.*

---

### Message to the child (`message`)
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validation.message.required` | The message field is empty. | The user must enter a message for the child. |
| `validation.message.hasContent` | The field has only whitespace or only empty HTML (e.g. tags with no text). | The message must contain actual content (not only spaces or empty formatting). Ask the user to type a real message. |

---

## Search message form (child-facing)

### First name / Last name / Birth year
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `search.errorFillAll` | One or more of first name, last name, or birth year is missing or empty. | Ask the user to fill in all fields (first name, last name, and birth year). |
| `search.errorNotFound` | All fields are filled but no matching card exists in the system. | No card matches the entered details. Ask them to check spelling and birth year, or say that no message was found for those details. |

---

## Message reply form (child replying to parent)

### Reply message content
| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `error.replyContentRequired` | User tries to send a reply with an empty message (or only whitespace). | The reply message cannot be empty. Ask the user to type a message before sending. |

---

## Save / Submit – validation toast (one key, plural)

| Key | When it happens | Explanation for UX writer |
|-----|-----------------|---------------------------|
| `validationToast` (with plural: `validationToast_one`, `validationToast_other`) | User clicks “Save” (or equivalent) and one or more form fields have validation errors. | **One error:** Single sentence telling the user to fix the one issue before continuing (e.g. “Fix the issue to continue.”). **More than one error:** Same idea in plural (e.g. “Fix the issues to continue.”). Used in a toast that draws attention to the form. |

*Implementation uses i18next plural: `validationToast_one` for count 1, `validationToast_other` for count > 1.*

---

## Example of a good error message (from the brief)

- **Bad:** “Error” or “Invalid.”
- **Good:** “Please enter the child’s first name.” (clear, actionable, polite.)

All keys above are already present in `src/assets/locale/messages_*.json`; the UX writer only needs to provide or adjust the translated strings for each key in each language.
