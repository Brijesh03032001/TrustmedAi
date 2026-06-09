#!/usr/bin/env python3
"""Evaluate TrustMed-AI retrieval precision@K over the 100-prompt dataset.

This script measures the retrieval layer only. It does not call the answer LLM.
Relevance is judged from expected collection labels plus keyword/topic overlap in
the retrieved chunk text and metadata, which makes the score reproducible and
cheap enough to run during demos.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import statistics
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence

import chromadb

from anti_test import CHROMA_DB_DIR, EMBEDDING_MODEL_NAME, SentenceTransformerEmbeddings, ann_search


DEFAULT_DATASET = "evaluation_dataset_100.json"
DEFAULT_OUTPUT_DIR = "benchmark_results"
DEFAULT_K_VALUES = [1, 3, 5, 10]
STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "can", "for", "from", "how",
    "in", "is", "it", "of", "on", "or", "the", "to", "used", "what", "with",
}


@dataclass
class QueryCase:
    query: str
    expected_keywords: List[str]
    expected_collections: List[str]
    topic: str
    domain: str
    difficulty: str


@dataclass
class RetrievedDoc:
    rank: int
    collection: str
    doc_id: str
    similarity: float
    title: str
    section: str
    relevant: bool
    relevance_reasons: List[str]


@dataclass
class QueryResult:
    query: str
    topic: str
    domain: str
    difficulty: str
    expected_collections: List[str]
    precision_at_k: Dict[str, float]
    collection_hit_at_k: Dict[str, bool]
    reciprocal_rank: float
    avg_similarity_top_k: Dict[str, float]
    retrieved: List[RetrievedDoc]


def tokenize(text: str) -> set[str]:
    return {tok for tok in re.findall(r"[a-z0-9]+", text.lower()) if tok not in STOPWORDS and len(tok) > 1}


def load_cases(path: Path, limit: Optional[int]) -> List[QueryCase]:
    data = json.loads(path.read_text(encoding="utf-8"))
    cases = [
        QueryCase(
            query=item["query"],
            expected_keywords=item.get("expected_keywords", []),
            expected_collections=item.get("expected_collections", []),
            topic=item.get("topic", "unknown"),
            domain=item.get("domain", "unknown"),
            difficulty=item.get("difficulty", "unknown"),
        )
        for item in data.get("single_turn_queries", [])
    ]
    return cases[:limit] if limit else cases


def metadata_text(meta: Dict[str, Any]) -> str:
    values: List[str] = []
    for key in ("title", "disease_name", "section", "table", "collection", "url", "source_url"):
        if meta.get(key):
            values.append(str(meta[key]))
    fields = meta.get("fields")
    if isinstance(fields, dict):
        values.extend(str(value) for value in fields.values())
    return " ".join(values)


def infer_collection(collection_name: str, meta: Dict[str, Any]) -> str:
    return str(meta.get("collection") or meta.get("table") or collection_name)


def relevance_reasons(case: QueryCase, collection: str, text: str, meta: Dict[str, Any]) -> List[str]:
    haystack = f"{text} {metadata_text(meta)}".lower()
    reasons: List[str] = []

    if collection in case.expected_collections:
        reasons.append("expected_collection")

    topic_terms = tokenize(case.topic.replace("_", " "))
    if topic_terms and topic_terms.intersection(tokenize(haystack)):
        reasons.append("topic_overlap")

    matched_keywords = [kw for kw in case.expected_keywords if kw.lower() in haystack]
    if matched_keywords:
        reasons.append(f"keyword_overlap:{','.join(matched_keywords[:4])}")

    # A retrieved chunk is counted as relevant when it is from an expected
    # collection and has some content signal, or when it has strong keyword
    # overlap even if the source table label is imperfect.
    if "expected_collection" in reasons and (len(reasons) > 1):
        return reasons
    if len(matched_keywords) >= 2:
        return reasons
    return []


def retrieve_global(
    case: QueryCase,
    client: chromadb.PersistentClient,
    embedder: SentenceTransformerEmbeddings,
    n_results_per_collection: int,
) -> List[RetrievedDoc]:
    query_vec = embedder.encode([case.query])[0]
    ranked: List[RetrievedDoc] = []

    for collection in client.list_collections():
        try:
            docs = ann_search(collection, query_vec, n_results_per_collection)
        except Exception as exc:
            print(f"[warn] collection {collection.name} skipped: {exc}")
            continue

        for doc in docs:
            source_collection = infer_collection(collection.name, doc.meta)
            reasons = relevance_reasons(case, source_collection, doc.text, doc.meta)
            ranked.append(
                RetrievedDoc(
                    rank=0,
                    collection=source_collection,
                    doc_id=doc.id,
                    similarity=round(float(doc.s_embed), 6),
                    title=str(doc.meta.get("title") or doc.meta.get("disease_name") or ""),
                    section=str(doc.meta.get("section") or ""),
                    relevant=bool(reasons),
                    relevance_reasons=reasons,
                )
            )

    ranked.sort(key=lambda item: item.similarity, reverse=True)
    for idx, doc in enumerate(ranked, start=1):
        doc.rank = idx
    return ranked


def precision_at(retrieved: Sequence[RetrievedDoc], k: int) -> float:
    top = list(retrieved[:k])
    if not top:
        return 0.0
    return sum(1 for doc in top if doc.relevant) / len(top)


def collection_hit_at(retrieved: Sequence[RetrievedDoc], expected_collections: Sequence[str], k: int) -> bool:
    expected = set(expected_collections)
    return any(doc.collection in expected for doc in retrieved[:k])


def reciprocal_rank(retrieved: Sequence[RetrievedDoc]) -> float:
    for doc in retrieved:
        if doc.relevant:
            return 1.0 / doc.rank
    return 0.0


def mean(values: Iterable[float]) -> float:
    values = list(values)
    return statistics.mean(values) if values else 0.0


def evaluate(args: argparse.Namespace) -> Dict[str, Any]:
    dataset_path = Path(args.dataset)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    k_values = sorted(set(args.k_values))
    max_k = max(k_values)

    cases = load_cases(dataset_path, args.limit)
    client = chromadb.PersistentClient(path=os.environ.get("CHROMA_DB_DIR", CHROMA_DB_DIR))
    embedder = SentenceTransformerEmbeddings(EMBEDDING_MODEL_NAME)
    embedder.encode(["warm up retrieval evaluator"])

    results: List[QueryResult] = []
    for idx, case in enumerate(cases, start=1):
        print(f"[{idx}/{len(cases)}] {case.query}")
        retrieved = retrieve_global(case, client, embedder, max(args.per_collection_k, max_k))
        result = QueryResult(
            query=case.query,
            topic=case.topic,
            domain=case.domain,
            difficulty=case.difficulty,
            expected_collections=case.expected_collections,
            precision_at_k={f"p@{k}": round(precision_at(retrieved, k), 4) for k in k_values},
            collection_hit_at_k={f"hit@{k}": collection_hit_at(retrieved, case.expected_collections, k) for k in k_values},
            reciprocal_rank=round(reciprocal_rank(retrieved), 4),
            avg_similarity_top_k={
                f"sim@{k}": round(mean(doc.similarity for doc in retrieved[:k]), 4)
                for k in k_values
            },
            retrieved=retrieved[: args.keep_details],
        )
        results.append(result)

    summary = {
        "generated_at": datetime.now().strftime("%Y%m%d_%H%M%S"),
        "dataset": str(dataset_path),
        "query_count": len(results),
        "embedding_model": EMBEDDING_MODEL_NAME,
        "chroma_db_dir": os.environ.get("CHROMA_DB_DIR", CHROMA_DB_DIR),
        "k_values": k_values,
        "metrics": {
            f"avg_p@{k}": round(mean(r.precision_at_k[f"p@{k}"] for r in results), 4)
            for k in k_values
        },
        "collection_hit_rates": {
            f"hit_rate@{k}": round(mean(1.0 if r.collection_hit_at_k[f"hit@{k}"] else 0.0 for r in results), 4)
            for k in k_values
        },
        "mean_reciprocal_rank": round(mean(r.reciprocal_rank for r in results), 4),
        "by_domain": {},
        "results": [asdict(result) for result in results],
    }

    domains = sorted({result.domain for result in results})
    for domain in domains:
        domain_results = [result for result in results if result.domain == domain]
        summary["by_domain"][domain] = {
            f"avg_p@{k}": round(mean(r.precision_at_k[f"p@{k}"] for r in domain_results), 4)
            for k in k_values
        }
        summary["by_domain"][domain]["mean_reciprocal_rank"] = round(
            mean(r.reciprocal_rank for r in domain_results), 4
        )

    return summary


def write_reports(summary: Dict[str, Any], output_dir: Path) -> tuple[Path, Path]:
    stamp = summary["generated_at"]
    json_path = output_dir / f"retrieval_precision_{stamp}.json"
    md_path = output_dir / f"retrieval_precision_{stamp}.md"
    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    lines = [
        "# Retrieval Precision Report",
        "",
        f"Generated: {summary['generated_at']}",
        f"Dataset: `{summary['dataset']}`",
        f"Queries evaluated: {summary['query_count']}",
        f"Embedding model: `{summary['embedding_model']}`",
        "",
        "## Overall Metrics",
        "",
        "| Metric | Value |",
        "|---|---:|",
    ]
    for key, value in summary["metrics"].items():
        lines.append(f"| {key} | {value:.2%} |")
    for key, value in summary["collection_hit_rates"].items():
        lines.append(f"| {key} | {value:.2%} |")
    lines.append(f"| mean_reciprocal_rank | {summary['mean_reciprocal_rank']:.4f} |")

    lines.extend(["", "## Domain Breakdown", "", "| Domain | P@3 | P@5 | MRR |", "|---|---:|---:|---:|"])
    for domain, metrics in summary["by_domain"].items():
        lines.append(
            f"| {domain} | {metrics.get('avg_p@3', 0):.2%} | "
            f"{metrics.get('avg_p@5', 0):.2%} | {metrics.get('mean_reciprocal_rank', 0):.4f} |"
        )

    lines.extend(
        [
            "",
            "## Interpretation",
            "",
            "- Precision@K is computed before answer generation, using Chroma retrieval results.",
            "- A chunk is considered relevant when it matches the expected collection and topic/keyword signals, or when it has strong keyword overlap.",
            "- This is a retrieval-quality benchmark, not a clinical safety or diagnostic accuracy benchmark.",
        ]
    )
    md_path.write_text("\n".join(lines), encoding="utf-8")
    return json_path, md_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate TrustMed-AI retrieval precision@K")
    parser.add_argument("--dataset", default=DEFAULT_DATASET)
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--k-values", nargs="+", type=int, default=DEFAULT_K_VALUES)
    parser.add_argument("--per-collection-k", type=int, default=20)
    parser.add_argument("--keep-details", type=int, default=10)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    summary = evaluate(args)
    json_path, md_path = write_reports(summary, Path(args.output_dir))
    print(f"\nWrote JSON: {json_path}")
    print(f"Wrote report: {md_path}")


if __name__ == "__main__":
    main()
