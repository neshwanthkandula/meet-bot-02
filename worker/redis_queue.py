import redis
import json
import os

redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True
)

QUEUE = "meeting_jobs"


def pop_job():
    item = redis_client.blpop(QUEUE, timeout=5)
    if item:
        _, payload = item
        return json.loads(payload)
    return None