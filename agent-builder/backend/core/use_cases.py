from core.interfaces import UserRepository, AppRepository, KnowledgeRepository, DocumentRepository
import requests
import json
from typing import List

class AppService:
    def __init__(self, app_repo: AppRepository):
        self.app_repo = app_repo

    def list_apps(self, user_id: int):
        return self.app_repo.get_all_by_owner(user_id)

    def create_app(self, app_data: dict, user_id: int):
        return self.app_repo.create(app_data, user_id)

    def update_app(self, app_id: int, app_data: dict, user_id: int):
        return self.app_repo.update(app_id, app_data, user_id)

    def delete_app(self, app_id: int, user_id: int):
        return self.app_repo.delete(app_id, user_id)

class KnowledgeService:
    def __init__(self, knowledge_repo: KnowledgeRepository, doc_repo: DocumentRepository):
        self.knowledge_repo = knowledge_repo
        self.doc_repo = doc_repo

    def list_knowledges(self, user_id: int):
        return self.knowledge_repo.get_all_by_owner(user_id)

    def create_knowledge(self, kn_data: dict, user_id: int):
        return self.knowledge_repo.create(kn_data, user_id)

    def delete_knowledge(self, kn_id: int, user_id: int):
        return self.knowledge_repo.delete(kn_id, user_id)

    def list_documents(self, kn_id: int):
        return self.doc_repo.get_all_by_knowledge(kn_id)

    def add_document(self, kn_id: int, doc_data: dict):
        # Generate embedding via Ollama
        kn = self.knowledge_repo.get_by_id(kn_id)
        model = kn.embedding_model if kn and kn.embedding_model else "nomic-embed-text"
        
        try:
            res = requests.post("http://localhost:11434/api/embeddings", json={
                "model": model,
                "prompt": doc_data["content"]
            })
            if res.ok:
                embedding = res.json().get("embedding")
                doc_data["embedding"] = json.dumps(embedding)
        except Exception as e:
            print(f"Embedding failed: {e}")
            
        return self.doc_repo.create(doc_data, kn_id)

    def retrieve_context(self, kn_id: int, query: str):
        kn = self.knowledge_repo.get_by_id(kn_id)
        if not kn: return ""
        
        model = kn.embedding_model or "nomic-embed-text"
        top_k = kn.top_k or 5
        threshold = kn.threshold or 0.5

        # Generate embedding for query
        try:
            res = requests.post("http://localhost:11434/api/embeddings", json={
                "model": model,
                "prompt": query
            })
            if res.ok:
                q_embedding = res.json().get("embedding")
                relevant_docs = self.doc_repo.search_by_knowledge(kn_id, q_embedding, limit=top_k, threshold=threshold)
                return "\n\n".join([doc.content for doc in relevant_docs])
        except Exception as e:
            print(f"Retrieval failed: {e}")
            
        return ""

class ChatService:
    def __init__(self, app_repo: AppRepository, knowledge_service: KnowledgeService):
        self.app_repo = app_repo
        self.knowledge_service = knowledge_service

    def chat(self, app_id: int, message: str, owner_id: int):
        app = self.app_repo.get_by_id(app_id)
        if not app or app.owner_id != owner_id:
            return "App not found."

        context = ""
        if app.knowledge_id:
            context = self.knowledge_service.retrieve_context(app.knowledge_id, message)

        system_prompt = app.prompt or "You are a helpful assistant."
        full_prompt = f"System: {system_prompt}\n\nContext: {context}\n\nUser: {message}\n\nAssistant:"

        try:
            model = app.model_id.replace("ollama/", "") if app.model_id else "gemini-3-flash-preview:cloud"
            res = requests.post("http://localhost:11434/api/generate", json={
                "model": model,
                "prompt": full_prompt,
                "stream": False
            })
            if res.ok:
                return res.json().get("response")
        except Exception as e:
            return f"Chat failed: {e}"

        return "Internal Error"

    def summarize(self, history: List[dict]):
        if not history: return "No conversation history to summarize."
        
        conversation_text = ""
        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            content = msg["content"]
            # Exclude service messages
            if content.startswith("📝 회의 요약:"): continue
            conversation_text += f"{role}: {content}\n"
            
        prompt = f"Please summarize the following conversation in Korean. Highlight key decisions and action items if any.\n\nConversation:\n{conversation_text}\n\nSummary:"
        print(f"DEBUG: Summarizing with history length {len(history)}")
        
        try:
            # Using Gemini 3 Flash for summary as default
            res = requests.post("http://localhost:11434/api/generate", json={
                "model": "gemini-3-flash-preview:cloud",
                "prompt": prompt,
                "stream": False
            }, timeout=30)
            if res.ok:
                resp = res.json().get("response")
                print(f"DEBUG: Summary success: {resp[:50]}...")
                return resp
            else:
                print(f"DEBUG: Summary failed with status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"DEBUG: Summarization exception: {e}")
            return f"Summarization failed: {e}"
        return "Internal Error"

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_user_by_email(self, email: str):
        return self.user_repo.get_by_email(email)

    def create_user(self, user_data: dict):
        return self.user_repo.create(user_data)
