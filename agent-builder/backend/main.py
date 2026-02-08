from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import io
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

import models, schemas, database
from database import engine

# Hexagonal Components
from adapters.db_adapter import (
    SQLAlchemyUserRepository, 
    SQLAlchemyAppRepository, 
    SQLAlchemyKnowledgeRepository, 
    SQLAlchemyDocumentRepository
)
from adapters.auth_adapter import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user
)
from core.use_cases import AppService, KnowledgeService, UserService, ChatService
from models_provider import Provider

# Initialize Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agent Builder API (Hexagonal)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency Injection Helpers
def get_user_service(db: Session = Depends(database.get_db)):
    return UserService(SQLAlchemyUserRepository(db))

def get_app_service(db: Session = Depends(database.get_db)):
    return AppService(SQLAlchemyAppRepository(db))

def get_knowledge_service(db: Session = Depends(database.get_db)):
    return KnowledgeService(
        SQLAlchemyKnowledgeRepository(db),
        SQLAlchemyDocumentRepository(db)
    )

def get_chat_service(db: Session = Depends(database.get_db)):
    return ChatService(
        SQLAlchemyAppRepository(db),
        get_knowledge_service(db)
    )

# --- Routes ---

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    user_service: UserService = Depends(get_user_service)
):
    user = user_service.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate, 
    user_service: UserService = Depends(get_user_service)
):
    if user_service.get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    return user_service.create_user({
        "email": user.email, 
        "hashed_password": hashed_password
    })

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Provider Management
@app.get("/providers")
def get_providers(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    providers = db.query(Provider).filter(Provider.owner_id == current_user.id).all()
    if not providers:
        for name in ["gemini", "claude", "chatgpt", "ollama"]:
            new_p = Provider(name=name, enabled=(name=="ollama"), owner_id=current_user.id)
            db.add(new_p)
        db.commit()
        providers = db.query(Provider).filter(Provider.owner_id == current_user.id).all()
    return providers

@app.put("/providers/{name}")
def update_provider(
    name: str,
    request: schemas.ProviderUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    provider = db.query(Provider).filter(Provider.name == name, Provider.owner_id == current_user.id).first()
    if not provider:
        provider = Provider(name=name, owner_id=current_user.id)
        db.add(provider)
    
    provider.enabled = request.enabled
    provider.api_key = request.api_key
    provider.base_url = request.base_url
    db.commit()
    return {"status": "success"}

# App CRUD
@app.get("/apps/", response_model=List[schemas.App])
def read_apps(
    current_user: models.User = Depends(get_current_user), 
    app_service: AppService = Depends(get_app_service)
):
    return app_service.list_apps(current_user.id)

@app.post("/apps/", response_model=schemas.App)
def create_app(
    app: schemas.AppCreate, 
    current_user: models.User = Depends(get_current_user), 
    app_service: AppService = Depends(get_app_service)
):
    return app_service.create_app(app.dict(), current_user.id)

@app.put("/apps/{app_id}", response_model=schemas.App)
def update_app(
    app_id: int, 
    app_update: schemas.AppCreate, 
    current_user: models.User = Depends(get_current_user), 
    app_service: AppService = Depends(get_app_service)
):
    updated = app_service.update_app(app_id, app_update.dict(), current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="App not found")
    return updated

@app.delete("/apps/{app_id}")
def delete_app(
    app_id: int, 
    current_user: models.User = Depends(get_current_user), 
    app_service: AppService = Depends(get_app_service)
):
    if not app_service.delete_app(app_id, current_user.id):
        raise HTTPException(status_code=404, detail="App not found")
    return {"message": "Success"}

# Knowledge CRUD
@app.get("/knowledges/", response_model=List[schemas.Knowledge])
def read_knowledges(
    current_user: models.User = Depends(get_current_user), 
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    return kn_service.list_knowledges(current_user.id)

@app.post("/knowledges/", response_model=schemas.Knowledge)
def create_knowledge(
    knowledge: schemas.KnowledgeCreate, 
    current_user: models.User = Depends(get_current_user), 
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    return kn_service.create_knowledge(knowledge.dict(), current_user.id)

@app.delete("/knowledges/{knowledge_id}")
def delete_knowledge(
    knowledge_id: int, 
    current_user: models.User = Depends(get_current_user), 
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    if not kn_service.delete_knowledge(knowledge_id, current_user.id):
        raise HTTPException(status_code=404, detail="Knowledge not found")
    return {"message": "Success"}

# Document CRUD
@app.get("/knowledges/{knowledge_id}/documents/", response_model=List[schemas.Document])
def read_documents(
    knowledge_id: int, 
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    return kn_service.list_documents(knowledge_id)

@app.post("/knowledges/{knowledge_id}/documents/", response_model=schemas.Document)
def create_document(
    knowledge_id: int, 
    document: schemas.DocumentCreate, 
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    return kn_service.add_document(knowledge_id, document.dict())

@app.post("/knowledges/{knowledge_id}/chunk")
def chunk_text(
    knowledge_id: int,
    request: schemas.ChunkConfig,
    text: str,
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    # LLM-based chunking simulation
    prompt = f"Split the following text into logical chunks for RAG. Return chunks as a JSON list of strings. Do not include any other text in your response. Text: {text}"
    try:
        res = requests.post("http://localhost:11434/api/generate", json={
            "model": request.model,
            "prompt": prompt,
            "stream": False
        })
        if res.ok:
            # Clean possible markdown block
            raw_response = res.json().get("response").strip()
            if "```json" in raw_response:
                raw_response = raw_response.split("```json")[-1].split("```")[0].strip()
            elif "```" in raw_response:
                raw_response = raw_response.split("```")[-1].split("```")[0].strip()
                
            chunks = json.loads(raw_response)
            if isinstance(chunks, list):
                for i, chunk in enumerate(chunks):
                    kn_service.add_document(knowledge_id, {
                        "title": f"Chunk {i+1}",
                        "content": str(chunk),
                        "metadata_info": json.dumps({"source": "LLM Chunking"})
                    })
                return {"status": "success", "count": len(chunks)}
    except Exception as e:
        print(f"Chunking Error: {e}")
    return {"status": "error"}

@app.post("/knowledges/{knowledge_id}/search")
def search_knowledge(
    knowledge_id: int,
    request: schemas.SearchRequest,
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    context = kn_service.retrieve_context(knowledge_id, request.query)
    return {"results": context}

@app.post("/knowledges/{knowledge_id}/upload")
async def upload_document(
    knowledge_id: int,
    file: UploadFile = File(...),
    kn_service: KnowledgeService = Depends(get_knowledge_service)
):
    content = await file.read()
    text_content = ""
    
    if file.filename.lower().endswith('.pdf'):
        if not PdfReader:
            raise HTTPException(status_code=500, detail="PDF processor not installed.")
        try:
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text_content += (page.extract_text() or "") + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    else:
        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Only text and PDF files are supported.")
    
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="No readable text found in file.")

    doc = kn_service.add_document(knowledge_id, {
        "title": file.filename,
        "content": text_content,
        "metadata_info": json.dumps({"source": "file-upload", "filename": file.filename})
    })
    return doc

@app.post("/apps/{app_id}/chat")
def chat_with_app(
    app_id: int,
    request: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    response = chat_service.chat(app_id, request.message, current_user.id)
    return {"response": response}

@app.post("/apps/summarize")
def summarize_conversation(
    request: schemas.SummarizeRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    summary = chat_service.summarize(request.history)
    return {"summary": summary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
