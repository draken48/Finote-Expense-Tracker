from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    role: str # user, assistant, system, tool
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    citation: Optional[str] = None # e.g. "Analyzed 47 transactions | Budget data grounded"
    timestamp: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    currency: Optional[str] = "INR"

class ToolCallLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result_summary: str

class AIChatResponse(BaseModel):
    response: str
    citations: List[str] = []
    tool_calls_executed: List[ToolCallLog] = []
    suggested_followups: List[str] = []
