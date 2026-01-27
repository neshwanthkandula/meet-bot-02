import requests
import os

BACKEND = os.getenv("BACKEND_BASE_URL")


def notify_backend(id, transcript_path, summary_path):
    requests.post(
        f"{BACKEND}/api/meetings/{id}/processed",
        json={
            "transcriptPath": transcript_path,
            "summaryPath": summary_path,
        },
        timeout=10,
    )