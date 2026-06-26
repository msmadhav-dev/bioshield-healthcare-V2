import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// GET /api/doctor-verification — the logged-in doctor's own verification
// status/details, or null if they haven't submitted one yet.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const verification = await prisma.doctorVerification.findUnique({ where: { userId } });
    return NextResponse.json({ verification: verification || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load verification status." }, { status: 500 });
  }
}

// POST /api/doctor-verification  { doctorName, hospitalName, registerNo?, registerProofUrl?, dlNo?, dlProofUrl?, address }
// Either registerNo/registerProofUrl OR dlNo/dlProofUrl must be present.
// Creates a new PENDING submission, or re-submits after a rejection.
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const body = await req.json();
    const { doctorName, hospitalName, registerNo, registerProofUrl, dlNo, dlProofUrl, address } = body;

    if (!doctorName?.trim() || !hospitalName?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "Doctor name, hospital name, and address are required." }, { status: 400 });
    }

    const hasRegister = !!(registerNo?.trim() || registerProofUrl);
    const hasDl        = !!(dlNo?.trim() || dlProofUrl);
    if (!hasRegister && !hasDl) {
      return NextResponse.json({ error: "Either a Register No. or a DL No. (or its photo) is required." }, { status: 400 });
    }

    const existing = await prisma.doctorVerification.findUnique({ where: { userId } });
    if (existing && existing.status !== "REJECTED") {
      return NextResponse.json({ error: "A verification request is already on file." }, { status: 409 });
    }

    const data = {
      doctorName:       doctorName.trim(),
      hospitalName:     hospitalName.trim(),
      registerNo:       registerNo || null,
      registerProofUrl: registerProofUrl || null,
      dlNo:             dlNo || null,
      dlProofUrl:        dlProofUrl || null,
      address:          address.trim(),
      status:           "PENDING",
      rejectionReason:  null,
      reviewedAt:       null,
    };

    const verification = existing
      ? await prisma.doctorVerification.update({ where: { userId }, data })
      : await prisma.doctorVerification.create({ data: { ...data, userId } });

    return NextResponse.json({ verification });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit verification." }, { status: 500 });
  }
}
