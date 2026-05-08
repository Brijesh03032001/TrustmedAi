#!/usr/bin/env python3
"""
Test script for the Medical RAG Chatbot API /search endpoint
"""

import requests
import json

# API endpoint
BASE_URL = "http://localhost:8001"
SEARCH_URL = f"{BASE_URL}/search"


def test_search(query, limit=5):
    """Test the search endpoint with a medical query"""
    payload = {"question": query, "limit": limit}

    try:
        response = requests.post(SEARCH_URL, json=payload)
        response.raise_for_status()

        results = response.json()

        print(f"\n🔍 Query: '{query}'")
        print(f"📊 Found {len(results)} results:")
        print("-" * 60)

        for i, result in enumerate(results, 1):
            print(f"{i}. {result['disease']}")
            print(f"   Similarity: {1 - result['distance']:.3f}")
            print(f"   Source: {result['source']}")
            print()

    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
    except json.JSONDecodeError:
        print("❌ Invalid JSON response")


if __name__ == "__main__":
    # Test various medical queries
    test_queries = [
        "joint pain and swelling",
        "skin rash and itching",
        "dizziness and fatigue",
        "cough and shortness of breath",
        "back pain and muscle weakness",
    ]

    print("🏥 Medical RAG Chatbot - Search Endpoint Test")
    print("=" * 50)

    for query in test_queries:
        test_search(query, limit=3)
