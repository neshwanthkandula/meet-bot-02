def extract_segments(transcript):
    if not transcript or not transcript.text:
        return []

    return [{
        "speaker": None,
        "text": transcript.text,
        "start": None,
        "end": None,
    }]