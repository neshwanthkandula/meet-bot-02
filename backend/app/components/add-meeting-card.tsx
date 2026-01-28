"use client"

import { useState } from "react"
import axios from "axios"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AddMeeting() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    meetingUrl: "",
    startDate: "",
    startTime: "",
    endTime: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const startTime = new Date(
        `${form.startDate}T${form.startTime}`
      )
      const endTime = new Date(
        `${form.startDate}T${form.endTime}`
      )

      await axios.post("/api/meetings", {
        title: form.title,
        meetingUrl: form.meetingUrl,
        startTime,
        endTime,
      })

      setOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create meeting")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-black hover:bg-blue-400">
            <Plus className="h-4 w-4" />
           Add Meeting
        </Button>
      </DialogTrigger>

      <DialogContent className="z-50 max-w-lg bg-black border border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-blue-400 text-center">
            Create Meeting
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Weekly sync"
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting URL</Label>
            <Input
              name="meetingUrl"
              value={form.meetingUrl}
              onChange={handleChange}
              placeholder="https://zoom.us/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-black hover:bg-blue-400"
          >
            {loading ? "Creating..." : "Create Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
