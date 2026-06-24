// Minimal in-memory rate limiter for OTP sends, keyed by phone number.
//
// Purpose: stop someone hammering /api/otp/send to burn through your MSG91
// WhatsApp credits or spam a victim's number. Allows a small burst, then a
// cooldown.
//
// Caveats: lives in process memory, resets on restart, not shared across
// multiple server instances. Fine for a single-instance deployment; swap for
// a shared store (Upstash Redis, etc) if you scale horizontally.

type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

const MAX_PER_WINDOW = 5;                 // max sends...
const WINDOW_MS      = 60 * 60 * 1000;    // ...per hour, per phone
const MIN_GAP_MS     = 30 * 1000;         // and at least 30s between consecutive sends

const lastSent = new Map<string, number>();

export function checkOtpRateLimit(phone: string): { allowed: boolean; reason?: string } {
  const now = Date.now();

  const last = lastSent.get(phone);
  if (last && now - last < MIN_GAP_MS) {
    const wait = Math.ceil((MIN_GAP_MS - (now - last)) / 1000);
    return { allowed: false, reason: `Please wait ${wait}s before requesting another OTP.` };
  }

  const entry = store.get(phone);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(phone, { count: 1, windowStart: now });
  } else {
    if (entry.count >= MAX_PER_WINDOW) {
      return { allowed: false, reason: "Too many OTP requests. Please try again later." };
    }
    entry.count += 1;
  }

  lastSent.set(phone, now);
  return { allowed: true };
}