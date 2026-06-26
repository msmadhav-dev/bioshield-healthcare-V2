import { NextRequest, NextResponse } from "next/server";

// GET /api/pincode/[code] — looks up an Indian PIN code and returns its
// city/district and state, using India Post's free public API.
// Proxied through our own server so the browser doesn't have to deal with
// any CORS restrictions, and so we can normalize the (slightly odd) response shape.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
    }

    const res  = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    const data = await res.json();

    const result = Array.isArray(data) ? data[0] : null;
    if (!result || result.Status !== "Success" || !result.PostOffice?.length) {
      return NextResponse.json({ error: "PIN code not found." }, { status: 404 });
    }

    const office = result.PostOffice[0];
    return NextResponse.json({
      district: office.District,
      state:    office.State,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to look up PIN code." }, { status: 500 });
  }
}
