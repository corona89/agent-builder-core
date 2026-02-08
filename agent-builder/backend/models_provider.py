from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # gemini, claude, chatgpt, ollama
    enabled = Column(Boolean, default=False)
    api_key = Column(String, nullable=True)
    base_url = Column(String, nullable=True) # For Ollama or proxy
    owner_id = Column(Integer, ForeignKey("users.id"))

class ProviderSchema(BaseModel):
    name: str
    enabled: bool
    api_key: Optional[str] = None
    base_url: Optional[str] = None

    class Config:
        from_attributes = True
