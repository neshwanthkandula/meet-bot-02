"use client"

import { useState } from "react"

type Message = {
  text: string
  isBot: boolean
}

type ChatProps = {
  ragQueryUrl: string
  userId: string
  meetingId?: string
}

export default function Chat({
  ragQueryUrl,
  userId,
  meetingId,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userText = input

    setMessages((prev) => [
      ...prev,
      { text: userText, isBot: false },
    ])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(ragQueryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          meeting_id: meetingId,
          question: userText
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          text: data.answer ?? "No response from model.",
          isBot: true,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "❌ Failed to fetch response.", isBot: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full max-h-[80vh] w-full max-w-3xl flex-col rounded-xl border border-border  bg-sidebar-accent/30 shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
        Chat AI
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.isBot ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                msg.isBot
                  ? "bg-muted text-foreground"
                  : "bg-blue-600 text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
              Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border bg-background px-3 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something about your meetings…"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
