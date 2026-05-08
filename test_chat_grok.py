#!/usr/bin/env python3
"""
Test script for the Medical RAG Chatbot API /chat endpoint with Grok
"""

import requests
import json
import os

# API endpoint
BASE_URL = "http://localhost:8001"
CHAT_URL = f"{BASE_URL}/chat"


def test_chat(question):
    """Test the chat endpoint with a medical question"""
    payload = {"question": question}

    try:
        print(f"\n🤖 Question: '{question}'")
        print("💭 Thinking... (This may take a few seconds with Grok)")
        print("-" * 60)

        response = requests.post(CHAT_URL, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()

        print(f"📋 Answer:\n{result['answer']}")
        print(f"\n📊 Confidence: {result.get('confidence', 'N/A'):.3f}")
        print(f"\n📚 Sources ({len(result.get('sources', []))}):")

        for i, source in enumerate(result.get("sources", []), 1):
            print(f"  {i}. {source}")

        return result

    except requests.exceptions.Timeout:
        print("⏰ Request timed out - Grok may be taking longer than expected")
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    print("🏥 Medical RAG Chatbot - Grok API Test")
    print("=" * 50)

    # Test questions
    test_questions = [
        "What are the main symptoms of diabetes?",
        "How is chest pain diagnosed and treated?",
        "What causes high blood pressure and how can it be managed?",
        "Tell me about the symptoms and treatment of asthma",
    ]

    print("\n🔄 Testing with sample questions...")

    for question in test_questions:
        test_chat(question)
        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
