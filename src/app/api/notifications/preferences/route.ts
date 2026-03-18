import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_REMIND_AT = ["1_hour_before", "1_day_before", "3_days_before"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(pref ?? { enabled: false, emailAddress: "", remindAt: ["1_day_before"] });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { enabled, emailAddress, remindAt } = body;
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }
  if (enabled && (!emailAddress || typeof emailAddress !== "string" || !EMAIL_REGEX.test(emailAddress))) {
    return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
  }
  if (!Array.isArray(remindAt) || remindAt.length === 0 || remindAt.some((r: string) => !VALID_REMIND_AT.includes(r))) {
    return NextResponse.json({ error: "remindAt must be: " + VALID_REMIND_AT.join(", ") }, { status: 400 });
  }
  const pref = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: { enabled, emailAddress, remindAt },
    create: { userId: session.user.id, enabled, emailAddress, remindAt },
  });
  return NextResponse.json(pref);
}
