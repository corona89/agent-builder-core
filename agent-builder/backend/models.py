from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
import json

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)
    api_key = Column(String, nullable=True)

class App(Base):
    __tablename__ = "apps"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    agent_type = Column(String, default="general") # general, meeting
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Playground settings
    model_id = Column(String, default="gpt-4o")
    prompt = Column(Text, nullable=True)
    mcp_tools = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    sub_agents = Column(String, nullable=True)
    middlewares = Column(String, nullable=True)
    knowledge_id = Column(Integer, ForeignKey("knowledges.id"), nullable=True)

class Knowledge(Base):
    __tablename__ = "knowledges"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    embedding_model = Column(String, default="nomic-embed-text")
    top_k = Column(Integer, default=5)
    threshold = Column(Float, default=0.5)

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    knowledge_id = Column(Integer, ForeignKey("knowledges.id"))
    parent_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    title = Column(String)
    content = Column(Text)
    embedding = Column(Text) # JSON string of vector
    metadata_info = Column(Text) # JSON string
