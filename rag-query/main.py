from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from logic import query_rag
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RAG Query Service")

class QueryRequest(BaseModel):
    user_id: str
    question: str
    meeting_id: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]


# --------------------------------------------------
# CORS: ALLOW ALL ORIGINS (NO CREDENTIALS)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # allow all
    allow_credentials=False,  # must be False with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    answer_text, sources = query_rag(
        user_id=req.user_id,
        question=req.question,
        meeting_id=req.meeting_id,
        top_k=2,
    )

    return QueryResponse(
        answer=answer_text,
        sources=sources,
    )