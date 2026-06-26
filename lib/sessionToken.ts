import crypto from "crypto";

// HMAC-signed session token, set as an httpOnly cookie so the browser can't
// read or tamper with it via JS, and so it survives page refreshes.
// Distinct from lib/otpToken.ts (which proves "this phone just passed OTP"
// for a few minutes) — this one proves "this browser is this logged-in user"
// for weeks.

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_COOKIE_NAME = "bioshield_session";

function getSecret(): string {
  const secret = process.env.OTP_TOKEN_SECRET; // reuse the same server secret
  if (!secret) throw new Error("OTP_TOKEN_SECRET is not set in the environment");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function issueSessionToken(userId: string): string {
  const expiry  = Date.now() + TTL_MS;
  const payload = `${userId}.${expiry}`;
  const sig     = sign(payload);
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;

    const payload  = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = sign(payload);

    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const [userId, expiryStr] = payload.split(".");
    const expiry = Number(expiryStr);
    if (!userId || !expiry || Date.now() > expiry) return null;

    return userId;
  } catch {
    return null;
  }
}
