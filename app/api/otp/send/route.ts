import { NextRequest, NextResponse } from "next/server";
import { checkOtpRateLimit } from "@/lib/rateLimit";
import { generateOtp } from "@/lib/otpStore";

// POST /api/otp/send  { phone: "9876543210" }
//
// Sends a 6-digit OTP over WhatsApp using your connected MSG91 WhatsApp number
// and "bioshield_otp" Authentication-category template. No DLT required.
//
// We generate the OTP ourselves (see lib/otpStore.ts) and pass it as the
// template's variable — MSG91's WhatsApp API just delivers the message, it
// doesn't generate/track the code for you.
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    const limit = checkOtpRateLimit(phone);
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.reason }, { status: 429 });
    }

    const authKey          = process.env.MSG91_AUTH_KEY;
    const integratedNumber = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER;
    const templateName     = process.env.MSG91_WHATSAPP_TEMPLATE_NAME;

    if (!authKey || !integratedNumber || !templateName) {
      console.error("MSG91 WhatsApp env vars missing");
      return NextResponse.json({ error: "WhatsApp OTP service not configured." }, { status: 500 });
    }

    const code = generateOtp(phone);

    const res = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
      method:  "POST",
      headers: { authkey: authKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        integrated_number: integratedNumber,
        content_type:      "template",
        payload: {
          messaging_product: "whatsapp",
          type:               "template",
          template: {
            name:      templateName,
            language:  { code: "en", policy: "deterministic" },
            namespace: null,
            to_and_components: [
              {
                to: [`91${phone}`],
                components: {
                  // Standard MSG91 WhatsApp Authentication template shape:
                  // the OTP appears in the body text and again in the
                  // "Copy Code" button. If your template's component keys
                  // differ, check the "Template Code" panel in MSG91 →
                  // WhatsApp → Templates and adjust the keys below to match.
                  body_1:   { type: "text", value: code },
                  button_1: { subtype: "url", type: "text", value: code },
                },
              },
            ],
          },
        },
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json({ success: true });
    }

    console.error("MSG91 WhatsApp send error:", data);
    return NextResponse.json({ error: "Failed to send WhatsApp OTP." }, { status: 502 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send WhatsApp OTP." }, { status: 500 });
  }
}
