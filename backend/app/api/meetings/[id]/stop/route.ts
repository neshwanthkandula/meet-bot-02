import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import redis from "@/lib/redis"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }

  if (meeting.status !== "RUNNING") {
    return NextResponse.json(
      { error: "Meeting not running" },
      { status: 400 }
    )
  }

  await prisma.meeting.update({
    where: { id },
    data: { status: "PROCESSING" },
  })

  const job = {
    meeting_id: id,
    participants: meeting.participants.map(p => ({
      user_id: p.user.id,
      name: p.user.name,
    })),
  }

  await redis.rpush("meeting_jobs", JSON.stringify(job))

  return NextResponse.json({
    status: "queued",
    id,
  })
}
