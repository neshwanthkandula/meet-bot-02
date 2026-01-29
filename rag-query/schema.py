from pydantic import BaseModel
from typing import Optional, List

class QueryRequest(BaseModel):
    user_id: str
    question: str
    meeting_id: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]