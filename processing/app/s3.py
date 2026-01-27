import boto3
import os

BUCKET = os.getenv("S3_BUCKET")

if not BUCKET:
    raise RuntimeError("S3_BUCKET environment variable not set")

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def download_recording(meeting_id: str, local_path: str):
    key = f"{meeting_id}/recording/recording.webm"

    # ✅ Ensure local directory exists
    os.makedirs(os.path.dirname(local_path), exist_ok=True)

    # Optional but safe
    s3.head_object(Bucket=BUCKET, Key=key)

    s3.download_file(BUCKET, key, local_path)


def upload_transcript(meeting_id: str, local_path: str):
    key = f"{meeting_id}/transcript/transcript.json"
    s3.upload_file(local_path, BUCKET, key)
    return f"s3://{BUCKET}/{key}"


def upload_summary(meeting_id: str, local_path: str):
    key = f"{meeting_id}/summary/summary.txt"
    s3.upload_file(local_path, BUCKET, key)
    return f"s3://{BUCKET}/{key}"
