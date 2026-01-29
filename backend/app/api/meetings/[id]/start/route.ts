import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }:  { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    if (
      meeting.status === "COMPLETED" || meeting.status === "PROCESSING" ||
      meeting.isBotAssigned
    ) {
      return NextResponse.json(
        { error: "Meeting cannot be started" },
        { status: 400 }
      )
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        status: "RUNNING",
        isBotAssigned: true,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("POST /api/meetings/[id]/start error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}