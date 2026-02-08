from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DocumentBase(BaseModel):
    title: str
    content: str
    parent_id: Optional[int] = None
    metadata_info: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    id: int
    knowledge_id: int

    class Config:
        from_attributes = True


class KnowledgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    embedding_model: Optional[str] = "nomic-embed-text"
    top_k: Optional[int] = 5
    threshold: Optional[float] = 0.5


class KnowledgeCreate(KnowledgeBase):
    pass


class Knowledge(KnowledgeBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True


class AppBase(BaseModel):
    name: str
    description: Optional[str] = None
    agent_type: Optional[str] = "general"
    model_id: Optional[str] = "gpt-4o"
    prompt: Optional[str] = None
    mcp_tools: Optional[str] = None
    skills: Optional[str] = None
    sub_agents: Optional[str] = None
    middlewares: Optional[str] = None
    knowledge_id: Optional[int] = None


class AppCreate(AppBase):
    pass

class ProviderUpdate(BaseModel):
    enabled: bool
    api_key: Optional[str] = None
    base_url: Optional[str] = None

class SummarizeRequest(BaseModel):
    history: List[dict]


class App(AppBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChunkConfig(BaseModel):
    model: str = "deepseek-r1:8b"

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
