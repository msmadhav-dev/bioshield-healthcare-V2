// In-memory OTP store, server-side only.
//
// MSG91's WhatsApp template API just sends a WhatsApp message — it does not
// generate or verify the code for you. So here, WE generate the 6-digit code,
// send it as a WhatsApp template variable, and check what the user typed
// against what we stored.
//
// Caveat: lives in process memory, resets on restart, not shared across
// multiple server instances. Fine for a single-instance deployment; swap for
// Redis/Upstash if you ever scale horizontally.

type Entry = { code: string; expiresAt: number };

const store = new Map<string, Entry>();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateOtp(phone: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

// One-time use: a correct match deletes the entry so it can't be replayed.
export function verifyOtp(phone: string, code: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }

  const valid = entry.code === code;
  if (valid) store.delete(phone);
  return valid;
}