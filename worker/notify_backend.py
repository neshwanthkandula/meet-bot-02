import requests
import os

BACKEND = os.getenv("BACKEND_BASE_URL")


def notify_backend(id):
    requests.post(
        f"{BACKEND}/api/meetings/{id}/end",
        timeout=10,
    )