from abc import ABC, abstractmethod
from typing import List, Optional

class UserRepository(ABC):
    @abstractmethod
    def get_by_email(self, email: str):
        pass

    @abstractmethod
    def create(self, user):
        pass

class AppRepository(ABC):
    @abstractmethod
    def get_all_by_owner(self, owner_id: int):
        pass

    @abstractmethod
    def get_by_id(self, app_id: int):
        pass

    @abstractmethod
    def create(self, app_data, owner_id: int):
        pass

    @abstractmethod
    def update(self, app_id: int, app_data):
        pass

    @abstractmethod
    def delete(self, app_id: int):
        pass

class KnowledgeRepository(ABC):
    @abstractmethod
    def get_all_by_owner(self, owner_id: int):
        pass

    @abstractmethod
    def get_by_id(self, knowledge_id: int):
        pass

    @abstractmethod
    def create(self, knowledge_data, owner_id: int):
        pass

    @abstractmethod
    def delete(self, knowledge_id: int):
        pass

class DocumentRepository(ABC):
    @abstractmethod
    def get_all_by_knowledge(self, knowledge_id: int):
        pass

    @abstractmethod
    def create(self, doc_data, knowledge_id: int):
        pass

    @abstractmethod
    def search_by_knowledge(self, knowledge_id: int, query_embedding: List[float], limit: int = 5, threshold: float = 0.5):
        pass
