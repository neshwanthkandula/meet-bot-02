from dotenv import load_dotenv
load_dotenv()

import os
import json
import time
import uuid

from audio import extract_audio
from s3 import (
    download_recording,
    upload_transcript,
    upload_summary,
)
from redis_queue import pop_job
from whisper_asr import transcribe_audio
from summarize import summarize
from rag.chunk import chunk_segments
from rag.index import index_chunks
from notify_backend import notify_backend

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
TMP_DIR = "tmp"
os.makedirs(TMP_DIR, exist_ok=True)

print("🟢 Worker started. Waiting for Redis jobs...")


# ------------------------------------------------------------------
# MAIN WORKER LOOP
# ------------------------------------------------------------------
while True:
    job = pop_job()

    if not job:
        time.sleep(1)
        continue

    meeting_id = job["meeting_id"]
    user_ids = [p["user_id"] for p in job["participants"]]

    job_id = str(uuid.uuid4())
    video_file = os.path.join(TMP_DIR, f"{job_id}.webm")
    audio_file = os.path.join(TMP_DIR, f"{job_id}.wav")
    transcript_file = os.path.join(TMP_DIR, f"{job_id}.json")
    summary_file = os.path.join(TMP_DIR, f"{job_id}.txt")

    try:
        # ----------------------------------------------------------
        # 1. DOWNLOAD VIDEO FROM S3
        # ----------------------------------------------------------
        print(f"📥 Downloading recording for meeting {meeting_id}")
        download_recording(meeting_id, video_file)

        # ----------------------------------------------------------
        # 2. EXTRACT AUDIO
        # ----------------------------------------------------------
        print("🎧 Extracting audio")
        extract_audio(video_file, audio_file)

        # ----------------------------------------------------------
        # 3. TRANSCRIBE AUDIO (FASTER-WHISPER)
        # ----------------------------------------------------------
        print("🎙️ Transcribing audio with faster-whisper")
        segments = transcribe_audio(audio_file)

        if not segments:
            raise RuntimeError("Empty transcript produced")

        # ----------------------------------------------------------
        # 4. SAVE TRANSCRIPT (JSON)
        # ----------------------------------------------------------
        with open(transcript_file, "w", encoding="utf-8") as f:
            json.dump(segments, f, ensure_ascii=False, indent=2)

        # ----------------------------------------------------------
        # 5. GENERATE SUMMARY (LOCAL__LLM)
        # ----------------------------------------------------------
        print("📝 Generating meeting summary")
        summary_text = summarize(segments)

        with open(summary_file, "w", encoding="utf-8") as f:
            f.write(summary_text)

        # ----------------------------------------------------------
        # 6. UPLOAD TO S3
        # ----------------------------------------------------------
        transcript_s3 = upload_transcript(meeting_id, transcript_file)
        summary_s3 = upload_summary(meeting_id, summary_file)

        print("☁️ Uploaded transcript & summary")

        # ----------------------------------------------------------
        # 7. RAG INDEXING
        # ----------------------------------------------------------
        chunks = chunk_segments(segments)
        index_chunks(meeting_id, user_ids, chunks)

        print(f"✅ Successfully processed meeting {meeting_id}")

        # ----------------------------------------------------------
        # 8. (OPTIONAL) NOTIFY BACKEND
        # ----------------------------------------------------------
        notify_backend(meeting_id)

    except Exception as e:
        print(f"❌ Failed processing meeting {meeting_id}: {e}")

    finally:
        print("🧹 Cleanup (optional)")
        # Uncomment if you want cleanup
        for path in (video_file, audio_file, transcript_file, summary_file):
            if os.path.exists(path):
                os.remove(path)