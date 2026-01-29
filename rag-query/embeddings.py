from sentence_transformers import SentenceTransformer

# Load ONCE at startup
_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def embed_text(text: str) -> list[float]:
    return _model.encode(text).tolist()
