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
 * Encrypts a message using the security answer as the secret.
 * Returns { encryptedPayload, salt } so the salt can be stored for decryption.
 */
export async function encryptMessage(
  message: string,
  securityAnswer: string
): Promise<{ encryptedPayload: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKeyFromAnswer(securityAnswer, salt);
  const encryptedPayload = await encrypt(message, key);
  const saltB64 = btoa(String.fromCharCode(...salt));
  return { encryptedPayload, salt: saltB64 };
}

/**
 * Decrypts a message using the security answer and the stored salt.
 */
export async function decryptMessage(
  encryptedPayload: string,
  saltB64: string,
  securityAnswer: string
): Promise<string> {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await deriveKeyFromAnswer(securityAnswer, salt);
  return decrypt(encryptedPayload, key);
}
