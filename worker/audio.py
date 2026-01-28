import subprocess

def extract_audio(video_path: str, audio_path: str):
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-vn",          # remove video
            "-ac", "1",     # mono
            "-ar", "16000", # 16kHz
            "-f", "wav",
            audio_path,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )