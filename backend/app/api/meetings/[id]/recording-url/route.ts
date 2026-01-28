import { NextResponse } from "next/server";
import { getSignedRecordingUrl } from  "../../../../lib/s3";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
  });

  if (!meeting || meeting.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Recording not available" },
      { status: 404 }
    );
  }

  const url = await getSignedRecordingUrl(params.id);

  return NextResponse.json({ url });
}