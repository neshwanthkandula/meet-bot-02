"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { MeetingStatus } from "../generated/prisma/enums"

export interface Props {
  id: string
  title: string
  meetingUrl: string
  startTime: Date
  endTime: Date
  status: MeetingStatus
  isBotAssigned: boolean
  errorReason: string | null
  createdAt: Date
  updatedAt: Date
}

function statusColor(status: MeetingStatus) {
  switch (status) {
    case "RUNNING":
      return "bg-green-400 text-black"
    case "UPCOMING":
      return "bg-amber-400 text-black"
    case "COMPLETED":
      return "bg-blue-600 text-white"
    default:
      return "bg-red-400 text-black"
  }
}

function Meeting({ link }: { link: string }) {
  const [meetings, setMeetings] = useState<Props[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMeetings = async () => {
      const res = await axios.get<Props[]>(`/api/meetings/${link}`)
      setMeetings(Array.isArray(res.data) ? res.data : [])
      setLoading(false)
    }

    fetchMeetings()
  }, [link])

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading {link} meetings…
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-400">
        {link}
      </h2>

      {meetings.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No meetings found.
        </div>
      )}

      {meetings.map((meet) => {
        const isCompleted = meet.status === "COMPLETED"

        return (
          <div
            key={meet.id}
            onClick={() => {
              if (isCompleted) {
                router.push(`/meetings/${meet.id}/view`)
              }
            }}
            className={`flex items-center justify-between rounded-lg border border-border bg-sidebar-accent/30 p-4 transition
              ${
                isCompleted
                  ? "cursor-pointer hover:bg-sidebar-accent/50"
                  : "cursor-not-allowed opacity-60"
              }`}
          >
            {/* Left */}
            <div className="space-y-1">
              <div className="font-medium text-foreground">
                {meet.title}
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(meet.startTime).toLocaleString()} →{" "}
                {new Date(meet.endTime).toLocaleString()}
              </div>
            </div>

            {/* Right */}
            <div
              className={`rounded-md px-3 py-1 text-xs font-semibold ${statusColor(
                meet.status
              )}`}
            >
              {meet.status}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Meeting
