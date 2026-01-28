"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type Tab = "summary" | "recording" | "chat";

const getRecordingUrl = (meetingId: string) =>
  `https://my-sandbox-storage.s3.ap-southeast-2.amazonaws.com/${meetingId}/recording/recording.webm`;

const getSummaryUrl = (meetingId: string) =>
  `https://my-sandbox-storage.s3.ap-southeast-2.amazonaws.com/${meetingId}/summary/summary.txt`;

export default function MeetingView() {
  const params = useParams<{ id: string }>();
  const meetingId = params.id;

  const [tab, setTab] = useState<Tab>("summary");
  const [summary, setSummary] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");

  useEffect(() => {
    if (!meetingId) return;

    if (tab === "summary") {
      fetch(getSummaryUrl(meetingId))
        .then((res) => res.text())
        .then(setSummary)
        .catch(() => setSummary("Failed to load summary"));
    }

    if (tab === "recording") {
      setRecordingUrl(getRecordingUrl(meetingId));
    }
  }, [tab, meetingId]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {(["summary", "recording"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${
                tab === t
                  ? "bg-blue-500 text-black"
                  : "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400"
              }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}

        <button
          disabled
          className="px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed text-muted-foreground"
        >
          Chat (Coming Soon)
        </button>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-border bg-sidebar-accent/30 p-6">
        {tab === "summary" && (
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {summary || "Loading summary…"}
          </div>
        )}

        {tab === "recording" && recordingUrl && (
          <video
            controls
            className="w-full rounded-lg border border-border bg-black"
          >
            <source src={recordingUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
