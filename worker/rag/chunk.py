def chunk_segments(segments, max_words=300):
    chunks, current, count = [], [], 0

    for seg in segments:
        words = len(seg["text"].split())
        if count + words > max_words:
            chunks.append(current)
            current, count = [], 0

        current.append(seg)
        count += words

    if current:
        chunks.append(current)

    return chunks