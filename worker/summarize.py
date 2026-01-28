from local_llm import generate
from chunking_transcript import chunk_segments

def summarize(segments):
    chunks = chunk_segments(segments)

    print(f"🧩 Summarizing {len(chunks)} chunks using local LLaMA")

    partial_summaries = []

    # -------- MAP STEP --------
    for i, chunk in enumerate(chunks):
        print(f"✏️ Chunk {i + 1}/{len(chunks)}")

        prompt = f"""
            <s>[INST]
            Summarize the following meeting transcript chunk concisely.

            Transcript:
            {chunk}

            Summary:
            [/INST]
        """
        summary = generate(prompt, max_tokens=200)
        partial_summaries.append(summary)

    # -------- REDUCE STEP --------
    combined = "\n".join(partial_summaries)

    final_prompt = f"""
        <s>[INST]
        You are an AI meeting assistant.

        Using the partial summaries below, produce a structured final summary with:

        1. Executive Summary (bullet points)
        2. Key Decisions
        3. Action Items (with owners if mentioned)

        Partial summaries:
        {combined}
        [/INST]
    """

    final_summary = generate(
        final_prompt,
        max_tokens=400
    )

    return final_summary