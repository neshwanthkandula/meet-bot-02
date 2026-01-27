def summarize(segments):
    text = " ".join([seg["text"] for seg in segments])
    return text[:1000] + "..." if len(text) > 1000 else text