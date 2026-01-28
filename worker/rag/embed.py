from sentence_transformers import SentenceTransformer

# Load ONCE when the worker starts
_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def embed_text(text: str) -> list[float]:
    """
    Hugging Face / SentenceTransformers embedding.
    Free, local, fast, stable.
    """
    return _model.encode(text).tolist()