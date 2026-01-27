import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { v4 as uuid } from "uuid";
import fetch from "node-fetch";
import { startRecording, stopRecording } from "./recorder";
import { uploadRecording } from "./s3";
import { sessions } from "./sessionStore";
import axios from "axios"



const app = express();
app.use(express.json());

/**
 * START BOT
 */
app.post("/bot/start", async (req, res) => {
  try {
    const { meetingId, meetingUrl } = req.body;

    if (!meetingId || !meetingUrl) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (sessions.has(meetingId)) {
      return res.status(409).json({ error: "Bot already running for meeting" });
    }

    const recordingPath = `/tmp/${meetingId}-${uuid()}.webm`;

    const session = await startRecording(
      meetingId,
      meetingUrl,
      recordingPath
    );

    sessions.set(meetingId, session);

    return res.json({ status: "recording_started", meetingId });
  } catch (err: any) {
    console.error("BOT_START_ERROR:", err);
    return res.status(500).json({ error: "Failed to start bot" });
  }
});

/**
 * STOP BOT
 */
app.post("/bot/stop", async (req, res) => {
  try {
    const { meetingId } = req.body;

    if (!meetingId) {
      return res.status(400).json({ error: "meetingId required" });
    }

    const id = meetingId
    const meeting_id = id
    const session = sessions.get(meetingId);

    if (!session) {
      return res.status(404).json({ error: "No active bot for meeting" });
    }

    // 1. Stop recording
    await stopRecording(session);

    // 2. Upload to S3
    const s3Path = await uploadRecording(
      meetingId,
      session.recordingPath
    );

    // 3. Trigger processing (fire & forget)
    fetch(`${process.env.PROCESSING_BASE_URL}/process/${meeting_id}`, {
      method: "POST",
    }).catch((err) =>
      console.error("PROCESSING_TRIGGER_FAILED:", err.message)
    );

    //
    await axios.post(`${process.env.BBACKEND_BASE_URL}/api/meetings/${id}/stop`);

    // 4. Cleanup session
    sessions.delete(meetingId);

    return res.json({
      status: "uploaded",
      recordingPath: s3Path,
    });
  } catch (err: any) {
    console.error("BOT_STOP_ERROR:", err);
    return res.status(500).json({ error: "Failed to stop bot" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Bot listening on port ${process.env.PORT}`);
});
