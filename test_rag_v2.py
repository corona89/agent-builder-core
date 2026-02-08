import requests
import json

base_url = "https://spam-candidates-bouquet-tabs.trycloudflare.com"
login_data = {"username": "test@lion.ai", "password": "Password123!"}

try:
    # 1. Get Token
    res = requests.post(f"{base_url}/token", data=login_data)
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 2. Chat
    chat_data = {"message": "네 낙하산은 무엇으로 만들어졌니? 지식 베이스를 참고해서 대답해줘."}
    res = requests.post(f"{base_url}/apps/1/chat", headers=headers, json=chat_data)
    print(res.json())
except Exception as e:
    print(f"Error: {e}")
