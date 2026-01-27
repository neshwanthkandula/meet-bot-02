import subprocess
import imageio_ffmpeg


def extract_audio(video_path: str, audio_path: str):
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()

    command = [
        ffmpeg_path,
        "-y",                  # overwrite output
        "-i", video_path,      # input video
        "-vn",                 # no video
        "-ac", "1",            # mono
        "-ar", "16000",        # 16kHz
        audio_path,
    ]

    subprocess.run(
        command,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )