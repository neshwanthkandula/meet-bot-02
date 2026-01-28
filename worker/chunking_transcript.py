def chunk_segments(segments, max_chars=1200):
    chunks = []
    current = ""

    for seg in segments:
        text = seg.get("text", "").strip()
        if not text:
            continue

        if len(current) + len(text) > max_chars:
            chunks.append(current.strip())
            current = text
        else:
            current += " " + text

    if current.strip():
        chunks.append(current.strip())

    return chunks