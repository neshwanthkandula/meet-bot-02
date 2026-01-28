
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { meetingId, participants } = body;

  if (!meetingId || !participants) {
    return NextResponse.json(
      { error: "meetingId and participants are required" },
      { status: 400 }
    );
  }

  
}