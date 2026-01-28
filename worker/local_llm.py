from llama_cpp import Llama

MODEL_PATH = r"D:\Downloads\llama-2-7b-chat.Q4_K_M.gguf"

# Load once at import time
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=8,      # adjust to your CPU cores
    n_batch=256,
    verbose=False
)

def generate(prompt, max_tokens=256, temperature=0.1):
    result = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=["</s>"]
    )
    return result["choices"][0]["text"].strip()