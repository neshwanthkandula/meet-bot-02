from llama_cpp import Llama

MODEL_PATH =r"D:\Downloads\llama-2-7b-chat.Q4_K_M.gguf"

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=8,
    n_batch=128,
    verbose=False,
)

def answer(question: str, context: str) -> str:
    prompt = f"""
            <s>[INST]
            You are a helpful assistant.
            Answer the user's question using ONLY the context below.
            If the answer is not in the context, say you don't know.

            Context:
            {context}

            Question:
            {question}
            [/INST]
        """
    result = llm(prompt, max_tokens=300)
    return result["choices"][0]["text"].strip()