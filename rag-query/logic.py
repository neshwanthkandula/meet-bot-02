from embeddings import embed_text
from pinecone_client import index
from llm_local import answer


def query_rag(
    user_id: str,
    question: str,
    meeting_id: str | None = None,
    top_k: int = 5,
):
    # --------------------------------------------------
    # 1. Embed the QUESTION (same model as indexing)
    # --------------------------------------------------
    query_embedding = embed_text(question)

    # --------------------------------------------------
    # 2. Build Pinecone metadata filter
    # --------------------------------------------------
    if meeting_id:
        metadata_filter = {
            "meeting_id": meeting_id,
            "user_ids": {"$in": [user_id]},
        }
    else:
        metadata_filter = {
            "user_ids": {"$in": [user_id]},
        }

    # --------------------------------------------------
    # 3. Similarity search
    # --------------------------------------------------
    res = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter=metadata_filter,
    )

    matches = res.get("matches", [])
    if not matches:
        return "No relevant information found.", []

    # --------------------------------------------------
    # 4. Build context from matched chunks
    # --------------------------------------------------
    context_chunks = [
        m["metadata"]["text"]
        for m in matches
        if "text" in m["metadata"]
    ]

    context = "\n\n".join(context_chunks)

    # --------------------------------------------------
    # 5. Ask LLaMA using (question + retrieved context)
    # --------------------------------------------------
    final_answer = answer(question, context)

    sources = [m["id"] for m in matches]

    return final_answer, sources