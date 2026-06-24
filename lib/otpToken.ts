import crypto from "crypto";

// HMAC-signed, short-lived token proving that a given phone number passed OTP
// verification on the server. This is the gate that stops anyone from skipping
// the OTP step and POSTing straight to /api/users with an arbitrary phone.
//
// The secret comes from the server environment only and is never sent to the client.
// Tokens are stateless (no DB row needed) and expire after TTL.

const TTL_MS = 10 * 60 * 1000; // token valid for 10 minutes after OTP success

function getSecret(): string {
  const secret = process.env.OTP_TOKEN_SECRET;
  if (!secret) {
    throw new Error("OTP_TOKEN_SECRET is not set in the environment");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

// Issue a token for a phone that just passed OTP. Format: base64(phone.expiry).signature
export function issuePhoneToken(phone: string): string {
  const expiry  = Date.now() + TTL_MS;
  const payload = `${phone}.${expiry}`;
  const sig     = sign(payload);
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sig}`;
}

// Verify a token and return the phone it was issued for, or null if invalid/expired/tampered.
export function verifyPhoneToken(token: string): string | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;

    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = sign(payload);

    // constant-time comparison to avoid timing attacks
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const [phone, expiryStr] = payload.split(".");
    const expiry = Number(expiryStr);
    if (!phone || !expiry || Date.now() > expiry) return null;

    return phone;
  } catch {
    return null;
  }
}