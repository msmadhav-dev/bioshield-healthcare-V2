import { NextRequest, NextResponse } from "next/server";
import { issuePhoneToken } from "@/lib/otpToken";
import { verifyOtp } from "@/lib/otpStore";

// POST /api/otp/verify  { phone: "9876543210", otp: "123456" }
//
// Since we generate and own the OTP for WhatsApp delivery, verification is a
// direct match against our own store — there's no separate MSG91 "verify"
// call needed for this channel.
//
// On success, issues a short-lived signed token. /api/users (create/lookup)
// requires this token and reads the phone from inside it, never trusting a
// phone number passed directly from the client.
export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Enter the 6-digit OTP." }, { status: 400 });
    }

    const ok = verifyOtp(phone, otp);
    if (!ok) {
      return NextResponse.json({ verified: false, error: "Incorrect or expired OTP." }, { status: 400 });
    }

    const token = issuePhoneToken(phone);
    return NextResponse.json({ verified: true, token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}