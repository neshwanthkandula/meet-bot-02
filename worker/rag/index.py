from .embed import embed_text
import os
from pinecone import Pinecone

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))


def index_chunks(meeting_id, user_ids, chunks):
    vectors = []

    for i, chunk in enumerate(chunks):
        text = "\n".join(
            f'{s.get("speaker", "Speaker")}: {s["text"]}'
            for s in chunk
        )

        vectors.append({
            "id": f"{meeting_id}_{i}",
            "values": embed_text(text),
            "metadata": {
                "meeting_id": meeting_id,
                "user_ids": user_ids,
                "text": text,
            }
        })

    index.upsert(vectors)
