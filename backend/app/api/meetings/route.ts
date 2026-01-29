import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { MeetingStatus } from "@/app/generated/prisma/enums"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { meetingUrl, startTime, endTime, title } = await req.json()

    if (!meetingUrl || !startTime || !endTime || !title) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= new Date()) {
      return NextResponse.json(
        { error: "meeting already completed" },
        { status: 400 }
      )
    }

    if (end <= start) {
      return NextResponse.json(
        { error: "endTime must be after startTime" },
        { status: 400 }
      )
    }

    const status: MeetingStatus =
      start > new Date() ? "UPCOMING" : "RUNNING"

    // --------------------------------------------------
    // 1️⃣ Create or update meeting (atomic)
    // --------------------------------------------------
    const meeting = await prisma.meeting.upsert({
      where: { meetingUrl },
      update: {
        title,
        startTime: start,
        endTime: end,
        status,
      },
      create: {
        meetingUrl,
        title,
        startTime: start,
        endTime: end,
        status,
      },
    })

    // --------------------------------------------------
    // 2️⃣ Add user as participant (idempotent)
    // --------------------------------------------------
    await prisma.meetingParticipant.upsert({
      where: {
        meetingId_userId: {
          meetingId: meeting.id,
          userId,
        },
      },
      update: {},
      create: {
        meetingId: meeting.id,
        userId,
      },
    })

    return NextResponse.json(
      { success: true, meetingId: meeting.id },
      { status: 200 }
    )
  } catch (err) {
    console.error("Create meeting error:", err)
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        status: {
          in: ["RUNNING", "UPCOMING"],
        },
      },
    })

    return NextResponse.json({ meetings })
  } catch (err) {
    console.error("Fetch meetings error:", err)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}
