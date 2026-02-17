/**
 * Client-side encryption utilities for Nipagesha.
 * Child message content is encrypted using the Security Answer as the key.
 * Server must never receive the raw message or the key.
 *
 * Uses Web Crypto API (browser-native, no extra deps).
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Derives a crypto key from the user's Security Answer (password) using PBKDF2.
 */
export async function deriveKeyFromAnswer(
  answer: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(answer),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext with the given key. Returns base64( salt | iv | ciphertext ).
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: 128,
    },
    key,
    encoder.encode(plaintext)
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a payload produced by encrypt(). Expects base64( iv | ciphertext ).
 */
export async function decrypt(
  encodedPayload: string,
  key: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(encodedPayload), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: 128,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Encrypts a message using the password (e.g. security answer) as the secret.
 * Returns a single string: "saltBase64:payloadBase64" where payload is iv|ciphertext.
 * Use this for create-card; store only this string (never the raw message or password).
 */
export async function encryptMessage(
  text: string,
  password: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKeyFromAnswer(password, salt);
  const payload = await encrypt(text, key);
  const saltB64 = btoa(String.fromCharCode(...salt));
  return `${saltB64}:${payload}`;
}

/**
 * Decrypts a message from the combined "saltBase64:payloadBase64" format.
 * Used when the child enters the security answer to reveal the message.
 */
export async function decryptMessage(
  combined: string,
  password: string
): Promise<string> {
  const [saltB64, payloadB64] = combined.split(":");
  if (!saltB64 || !payloadB64) {
    throw new Error("Invalid encrypted message format");
  }
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await deriveKeyFromAnswer(password, salt);
  return decrypt(payloadB64, key);
}

/** Legacy: encrypt returning separate payload and salt (for DBs that store them in two columns). */
export async function encryptMessageWithSalt(
  message: string,
  securityAnswer: string
): Promise<{ encryptedPayload: string; salt: string }> {
  const combined = await encryptMessage(message, securityAnswer);
  const [saltB64, encryptedPayload] = combined.split(":");
  return { encryptedPayload: encryptedPayload ?? "", salt: saltB64 ?? "" };
}
