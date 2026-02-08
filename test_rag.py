import requests
import time

BASE_URL = "http://localhost:8001"

def test_rag_flow():
    # 1. Login
    print("Loging in...")
    login_res = requests.post(f"{BASE_URL}/token", data={"username": "corona89@nate.com", "password": "New1234!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Knowledge
    print("Creating Knowledge...")
    kn_res = requests.post(f"{BASE_URL}/knowledges/", headers=headers, json={"name": "Test RAG Vault"})
    kn_id = kn_res.json()["id"]
    print(f"Knowledge Created: {kn_id}")

    # 3. LLM Chunking
    test_text = "The quick brown fox jumps over the lazy dog. Artificial Intelligence is revolutionizing the world with RAG technology."
    print("Testing LLM Chunking...")
    chunk_res = requests.post(
        f"{BASE_URL}/knowledges/{kn_id}/chunk", 
        headers=headers, 
        json={"model": "deepseek-r1:8b"},
        params={"text": test_text}
    )
    print(f"Chunking Response: {chunk_res.json()}")

    # 4. Search Test
    print("Testing Retrieval...")
    search_res = requests.post(
        f"{BASE_URL}/knowledges/{kn_id}/search",
        headers=headers,
        json={"query": "What is AI?"}
    )
    print(f"Retrieval Results: {search_res.json()}")

if __name__ == "__main__":
    test_rag_flow()
