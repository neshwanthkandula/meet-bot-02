import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      orderBy: {
        endTime: "desc",
      },
    })

    return NextResponse.json(meetings )
  } catch (err) {
    console.error("GET /api/meetings/completed error:", err)
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}