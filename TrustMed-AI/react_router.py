#!/usr/bin/env python3
"""
ReAct-style query routing for TrustMed-AI.

This is a lightweight, deterministic Thought -> Action -> Observation planner
that chooses which medical retrieval collections to activate before RAG runs.
"""

from dataclasses import dataclass, asdict
from typing import Dict, List


@dataclass
class ReActStep:
    thought: str
    action: str
    observation: str


@dataclass
class ReActPlan:
    intent: str
    collections: List[str]
    steps: List[ReActStep]

    def to_trace(self) -> List[Dict[str, str]]:
        return [asdict(step) for step in self.steps]


def plan_medical_retrieval(query: str) -> ReActPlan:
    q = query.lower()
    collections: List[str] = []
    intent = "general"

    steps = [
        ReActStep(
            thought="Determine the medical information need before retrieval.",
            action="classify_query_intent",
            observation=f"Received query: {query}",
        )
    ]

    if any(term in q for term in ["symptom", "sign", "feel", "pain", "thirst", "urination", "headache"]):
        intent = "symptoms"
        collections.append("symptoms")

    if any(term in q for term in ["medicine", "medication", "drug", "dose", "side effect", "treat", "treatment", "therapy"]):
        intent = "treatment"
        collections.append("medicines")
        collections.append("diseases")

    if any(term in q for term in ["diagnos", "test", "cause", "risk", "prevent", "complication", "condition", "disease"]):
        if intent == "general":
            intent = "clinical_background"
        collections.append("diseases")
        collections.append("symptoms")

    if not collections:
        collections = ["symptoms", "medicines", "diseases"]

    # Preserve order while removing duplicates.
    collections = list(dict.fromkeys(collections))

    steps.append(
        ReActStep(
            thought="Choose retrieval tools based on the classified intent.",
            action="select_collections",
            observation=f"Selected collections: {', '.join(collections)}",
        )
    )
    steps.append(
        ReActStep(
            thought="Run retrieval with source-grounded evidence before generating an answer.",
            action="invoke_hybrid_rag",
            observation="Use ChromaDB candidates with optional FAISS refinement and cross-encoder reranking.",
        )
    )

    return ReActPlan(intent=intent, collections=collections, steps=steps)

