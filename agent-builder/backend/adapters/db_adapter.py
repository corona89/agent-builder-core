from sqlalchemy.orm import Session
from core.interfaces import UserRepository, AppRepository, KnowledgeRepository, DocumentRepository
import models
import json
import numpy as np

class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str):
        return self.db.query(models.User).filter(models.User.email == email).first()

    def create(self, user_data):
        db_user = models.User(**user_data)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

class SQLAlchemyAppRepository(AppRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_owner(self, owner_id: int):
        return self.db.query(models.App).filter(models.App.owner_id == owner_id).all()

    def get_by_id(self, app_id: int):
        return self.db.query(models.App).filter(models.App.id == app_id).first()

    def create(self, app_data, owner_id: int):
        db_app = models.App(**app_data, owner_id=owner_id)
        self.db.add(db_app)
        self.db.commit()
        self.db.refresh(db_app)
        return db_app

    def update(self, app_id: int, app_data, owner_id: int):
        db_app = self.db.query(models.App).filter(models.App.id == app_id, models.App.owner_id == owner_id).first()
        if db_app:
            for key, value in app_data.items():
                setattr(db_app, key, value)
            self.db.commit()
            self.db.refresh(db_app)
        return db_app

    def delete(self, app_id: int, owner_id: int):
        db_app = self.db.query(models.App).filter(models.App.id == app_id, models.App.owner_id == owner_id).first()
        if db_app:
            self.db.delete(db_app)
            self.db.commit()
            return True
        return False

class SQLAlchemyKnowledgeRepository(KnowledgeRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_owner(self, owner_id: int):
        return self.db.query(models.Knowledge).filter(models.Knowledge.owner_id == owner_id).all()

    def get_by_id(self, knowledge_id: int):
        return self.db.query(models.Knowledge).filter(models.Knowledge.id == knowledge_id).first()

    def create(self, knowledge_data, owner_id: int):
        db_knowledge = models.Knowledge(**knowledge_data, owner_id=owner_id)
        self.db.add(db_knowledge)
        self.db.commit()
        self.db.refresh(db_knowledge)
        return db_knowledge

    def delete(self, knowledge_id: int, owner_id: int):
        db_knowledge = self.db.query(models.Knowledge).filter(models.Knowledge.id == knowledge_id, models.Knowledge.owner_id == owner_id).first()
        if db_knowledge:
            self.db.delete(db_knowledge)
            self.db.commit()
            return True
        return False

class SQLAlchemyDocumentRepository(DocumentRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_knowledge(self, knowledge_id: int):
        return self.db.query(models.Document).filter(models.Document.knowledge_id == knowledge_id).all()

    def create(self, doc_data, knowledge_id: int):
        db_doc = models.Document(**doc_data, knowledge_id=knowledge_id)
        self.db.add(db_doc)
        self.db.commit()
        self.db.refresh(db_doc)
        return db_doc

    def search_by_knowledge(self, knowledge_id: int, query_embedding: list[float], limit: int = 5, threshold: float = 0.5):
        docs = self.get_all_by_knowledge(knowledge_id)
        results = []
        for doc in docs:
            if doc.embedding:
                try:
                    doc_emb = np.array(json.loads(doc.embedding))
                    q_emb = np.array(query_embedding)
                    
                    # Normalize for cosine similarity
                    norm_doc = np.linalg.norm(doc_emb)
                    norm_q = np.linalg.norm(q_emb)
                    
                    if norm_doc > 0 and norm_q > 0:
                        similarity = np.dot(doc_emb, q_emb) / (norm_doc * norm_q)
                        if similarity >= threshold:
                            results.append((doc, similarity))
                except Exception as e:
                    print(f"Similarity calculation failed for doc {doc.id}: {e}")
                    continue
        
        results.sort(key=lambda x: x[1], reverse=True)
        return [r[0] for r in results[:limit]]
