"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Chat from "../../../components/chat" // adjust path if needed
import { useAuth } from "@clerk/nextjs"

type Tab = "summary" | "recording" | "chat"

const getRecordingUrl = (meetingId: string) =>
  `https://my-sandbox-storage.s3.ap-southeast-2.amazonaws.com/${meetingId}/recording/recording.webm`

const getSummaryUrl = (meetingId: string) =>
  `https://my-sandbox-storage.s3.ap-southeast-2.amazonaws.com/${meetingId}/summary/summary.txt`

export default function MeetingView() {
  const params = useParams<{ id: string }>()
  const meetingId = params.id

  const {userId} = useAuth()
  const [tab, setTab] = useState<Tab>("summary")
  const [summary, setSummary] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")

  useEffect(() => {
    if (!meetingId) return

    if (tab === "summary") {
      fetch(getSummaryUrl(meetingId))
        .then((res) => res.text())
        .then(setSummary)
        .catch(() => setSummary("Failed to load summary"))
    }

    if (tab === "recording") {
      setRecordingUrl(getRecordingUrl(meetingId))
    }
  }, [tab, meetingId])

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* OUTER CARD (fixed width, never changes) */}
      <div className="rounded-xl border border-border bg-sidebar-accent/30 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border px-4 py-3">
          {(["summary", "recording", "chat"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition
                ${
                  tab === t
                    ? "bg-blue-500 text-black"
                    : "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400"
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* FIXED CONTENT AREA */}
        <div className="h-[70vh] w-full p-4 min-w-4xl max-w-4xl" >
          {/* Summary */}
          {tab === "summary" && (
            <div className="h-full w-full overflow-y-auto whitespace-pre-wrap text-sm text-foreground">
              {summary || "Loading summary…"}
            </div>
          )}

          {/* Recording */}
          {tab === "recording" && recordingUrl && (
            <div className="flex h-full w-full items-center justify-center min-w-4xl max-w-4xl">
              <video
                controls
                className="h-full max-h-full w-full rounded-lg border border-border bg-black object-contain"
              >
                <source src={recordingUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Chat */}
          {tab === "chat" && (
            <div className="flex h-full w-full items-center justify-center min-w-4xl max-w-4xl">
              {/* Chat itself has max width, but container stays fixed */}
              <div className="h-full w-full max-w-4xl pl-3">
                {userId ? (
                  <Chat
                    ragQueryUrl="http://localhost:8000/query"
                    userId={userId}
                    meetingId={meetingId}
                  />
                ) : (
                  <div className="text-muted-foreground">Please sign in to use chat</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
