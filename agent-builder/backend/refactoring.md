# Backend Refactoring Report (Hexagonal Architecture)

## Overview
The backend has been refactored from a monolithic script structure to a **Hexagonal (Ports and Adapters) Architecture**. This separates the core business logic from external details like the database (SQLAlchemy) and the web framework (FastAPI).

## Directory Structure Changes
```text
agent-builder/backend/
├── core/                # Domain Logic & Interfaces (The Hexagon)
│   ├── interfaces.py    # Abstract base classes (Repository Ports)
│   └── use_cases.py     # Application services (Business logic)
├── adapters/            # External Implementations (The Adapters)
│   ├── db_adapter.py    # SQLAlchemy implementations of ports
│   └── auth_adapter.py  # JWT and password authentication logic
├── main.py              # Entry point & API Routes (The Web Port)
├── models.py            # DB Models (Shared by DB adapter)
└── schemas.py           # Pydantic Schemas (Shared by Web port)
```

## Key Changes
1. **Dependency Inversion**: The business logic (`AppService`, `KnowledgeService`) now depends on abstract interfaces (`AppRepository`, etc.) rather than concrete database sessions.
2. **Decoupled Business Logic**: CRUD operations are moved to `core/use_cases.py`. This makes the logic testable without a database and easy to reuse.
3. **Primary & Secondary Adapters**:
   - **Primary Adapter**: FastAPI routes in `main.py` serve as the entry point.
   - **Secondary Adapter**: `SQLAlchemyAppRepository` and others in `adapters/db_adapter.py` handle data persistence.
4. **Improved Maintainability**: If we decide to switch the database (e.g., from SQLite to MongoDB) or the auth provider, we only need to write a new adapter without touching the core logic.

## Ollama Embedding Integration
1. **Model**: `nomic-embed-text` is now pulled and used in the backend.
2. **Automatic Embedding**: When a document is registered into the Knowledge Base, the backend automatically calls the Ollama API to generate a high-dimensional vector (embedding) for the content.
3. **Persistence**: Embeddings are stored in the database alongside the text content, preparing the system for full RAG (Retrieval Augmented Generation) capabilities.

## Full RAG (Retrieval Augmented Generation) Flow
1. **Embedding**: `nomic-embed-text` is used to vectorize documents and user queries.
2. **Retrieval**: When a user chats with an app linked to a knowledge base, the system performs a cosine similarity search (via `numpy` in the DB adapter) to find the top 5 relevant document snippets.
3. **Augmentation**: The retrieved context is injected into the system prompt.
4. **Generation**: The augmented prompt is sent to `deepseek-r1:8b` (via local Ollama) to generate a grounded response.
5. **Playground Interface**: The UI now supports real-time simulation tracing, allowing users to test their agents and see the RAG results in action.

## Deployment Details
- **Frontend**: https://cruel-foxes-slide.loca.lt
- **Backend API**: https://cruel-foxes-api.loca.lt
- **Default Admin**: `admin@admin.com` / `admin`
