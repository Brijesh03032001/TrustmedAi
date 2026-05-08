#!/usr/bin/env python3
import chromadb

# Connect to ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")
diseases_collection = client.get_collection("diseases")

print(f"Total documents: {diseases_collection.count()}")
results = diseases_collection.get(limit=3, include=["documents", "metadatas"])

for i, doc in enumerate(results["documents"]):
    print(f"\n--- Document {i + 1} ---")
    print(f"Length: {len(doc)} chars")
    print(f"First 300 chars: {doc[:300]}")
    if results["metadatas"] and results["metadatas"][i]:
        print(f"Metadata: {results['metadatas'][i]}")
    print()
