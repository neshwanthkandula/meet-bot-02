from faster_whisper import WhisperModel

# Load once at startup
model = WhisperModel(
    "base",
    device="cpu",        # change to "cuda" if available
    compute_type="int8"
)

def transcribe_audio(audio_path: str):
    segments, info = model.transcribe(audio_path)

    return [
        {
            "speaker": None,
            "text": seg.text.strip(),
            "start": seg.start,
            "end": seg.end,
        }
        for seg in segments
        if seg.text.strip()
    ]