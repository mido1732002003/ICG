import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("HF_API_TOKEN")
if not api_token:
    print("Error: HF_API_TOKEN not found in .env")
    exit(1)

# Models to test
model_30b = "Qwen/Qwen3-VL-30B-A3B-Instruct"
model_7b_vl = "Qwen/Qwen2-VL-7B-Instruct"
model_7b_text = "Qwen/Qwen2.5-7B-Instruct"

headers = {"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"}

print("--- Testing router.huggingface.co endpoints ---")

def test_url(name, url, payload):
    print(f"\nTesting {name}...")
    print(f"URL: {url}")
    print(f"Model in Payload: {payload.get('model') or 'N/A'}")
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS!")
            try:
                print(f"Response snippet: {str(response.json())[:200]}")
            except:
                print(f"Response text: {response.text[:200]}")
        else:
            print(f"Error: {response.text[:200]}")
    except Exception as e:
        print(f"Exception: {e}")

# 1. Test Chat Completions (OpenAI compatible) - Recommended for Router
chat_url = "https://router.huggingface.co/v1/chat/completions"

# Test 30B
test_url("Chat Completions (30B)", chat_url, {
    "model": model_30b,
    "messages": [{"role": "user", "content": "What is 1+1?"}],
    "max_tokens": 10
})

# Test 7B VL (Control)
test_url("Chat Completions (7B VL)", chat_url, {
    "model": model_7b_vl,
    "messages": [{"role": "user", "content": "What is 1+1?"}],
    "max_tokens": 10
})

# Test 7B Text (Control)
test_url("Chat Completions (7B Text)", chat_url, {
    "model": model_7b_text,
    "messages": [{"role": "user", "content": "What is 1+1?"}],
    "max_tokens": 10
})

# 2. Test legacy-style path on Router (hf-inference)
# Some users report router.huggingface.co/hf-inference/models/...
print("\n--- Testing Legacy-style paths on Router ---")

test_url("Direct Path (30B)", 
         f"https://router.huggingface.co/hf-inference/models/{model_30b}", 
         {"inputs": "Hello"})

test_url("Direct Path (7B Text)", 
         f"https://router.huggingface.co/hf-inference/models/{model_7b_text}", 
         {"inputs": "Hello"})
