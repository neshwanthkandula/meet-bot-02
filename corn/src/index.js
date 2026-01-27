import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BACKEND = process.env.BACKEND_BASE_URL;
const BOT = process.env.BOT_BASE_URL

if (!BACKEND ) {
  throw new Error("BACKEND_BASE_URL not set");
}

if (!BOT) {
  throw new Error("BACKEND_BASE_URL not set");
}

async function fetchMeetings() {
  const res = await axios.get(`${BACKEND}/api/meetings`);
  return res.data.meetings;
}

async function startMeeting(id , meetingUrl) {
  console.log(`Starting meeting ${id}`);
  await axios.post(`${BACKEND}/api/meetings/${id}/start`); //assign running & bot assigned = true
  await axios.post(`${BOT}/bot/start`, {
    meetingId: id, meetingUrl : meetingUrl,
  })
}

async function stopMeeting(id) {
  console.log(`Stopping meeting ${id}`);
  await axios.post(`${BOT}/bot/stop`, {
    meetingId: id
  })
}

function isTimeToStart(meeting) {
  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  return now<endTime && now>=startTime
}

function isTimeToStop(meeting) {
  const now = new Date();
  const endTime = new Date(meeting.endTime);
  return now >= new Date(endTime.getTime() + 60_000);
}

async function cronTick() {
  console.log("Cron tick:", new Date().toISOString());

  try {
    const meetings = await fetchMeetings();
    console.log(meetings)

    for (const meeting of meetings) {
      if (
        (meeting.status === "UPCOMING" || meeting.status=== "RUNNING" )&&
        !meeting.isBotAssigned &&
        isTimeToStart(meeting)
      ) {
        await startMeeting(meeting.id , meeting.meetingUrl);
      }

      if (
        meeting.status === "RUNNING" &&
        meeting.isBotAssigned &&
        isTimeToStop(meeting)
      ) {
        await stopMeeting(meeting.id);
      }
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
}

cron.schedule(process.env.CRON_INTERVAL, cronTick);

console.log("Cron service started");
