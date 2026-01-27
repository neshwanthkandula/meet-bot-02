from dotenv import load_dotenv
load_dotenv()

import os
import imageio_ffmpeg

# ---- MAKE WHISPER FIND FFMPEG (OS-INDEPENDENT) ----
ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_path)

# Prepend to PATH so `ffmpeg` is discoverable
os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

from fastapi import FastAPI
from app.s3 import (
    download_recording,
    upload_transcript,
    upload_summary,
)
from app.audio import extract_audio
from app.transcribe import transcribe_audio
from app.summarize import summarize
from app.backend import notify_backend
import uuid

app = FastAPI()

TMP_DIR = "tmp"
os.makedirs(TMP_DIR, exist_ok=True)


@app.post("/process/{meeting_id}")
def process(meeting_id: str):
    video_file = os.path.join(TMP_DIR, f"{uuid.uuid4()}.webm")
    audio_file = os.path.join(TMP_DIR, f"{uuid.uuid4()}.wav")
    transcript_file = os.path.join(TMP_DIR, f"{uuid.uuid4()}.json")
    summary_file = os.path.join(TMP_DIR, f"{uuid.uuid4()}.txt")
    print("download")
    download_recording(meeting_id, video_file)
    print("extract audio")
    extract_audio(video_file, audio_file)

    print("transcript")
    segments = transcribe_audio(audio_file)

    with open(transcript_file, "w", encoding="utf-8") as f:
        f.write(str(segments))

    summary = summarize(segments)
    with open(summary_file, "w", encoding="utf-8") as f:
        f.write(summary)

    print(transcript_file)
    transcript_s3 = upload_transcript(meeting_id, transcript_file)
    summary_s3 = upload_summary(meeting_id, summary_file)

    notify_backend(meeting_id, transcript_s3, summary_s3)

    return {"status": "processed"}
