#!/usr/bin/env python3
"""
Benchmark TrustMed-AI RAG modes for resume-safe evidence.

This script intentionally uses LocalHeuristicLLM so benchmarking does not depend on
OpenAI latency, API availability, or token cost. It compares:

1. single_collection_baseline: one Chroma collection, sequential execution
2. multi_agent_sequential: all selected collections, max_workers=1
3. multi_agent_parallel: all selected collections, max_workers=N

The quality score is keyword coverage from the existing evaluation dataset. Treat
it as answer keyword coverage, not clinical accuracy or precision@K.
"""

from __future__ import annotations

import argparse
import contextlib
import io
import json
import os
import statistics
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import chromadb

from anti_test import (
    CHROMA_DB_DIR,
    EMBEDDING_MODEL_NAME,
    LocalHeuristicLLM,
    SentenceTransformerEmbeddings,
    orchestrate,
)


DEFAULT_DATASET = "evaluation_dataset_extended.json"
DEFAULT_OUTPUT_DIR = "benchmark_results"


@dataclass
class QueryCase:
    query: str
    expected_keywords: List[str]
    topic: str
    difficulty: str


@dataclass
class ModeResult:
    mode: str
    query: str
    topic: str
    difficulty: str
    latency_ms: int
    keyword_coverage: float
    found_keywords: List[str]
    expected_keywords: List[str]
    docs_used: int
    avg_similarity: float
    collections_considered: List[str]
    per_agent_metrics: List[Dict[str, Any]]
    error: Optional[str] = None


def load_query_cases(dataset_path: Path, limit: Optional[int]) -> List[QueryCase]:
    with dataset_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    cases = [
        QueryCase(
            query=item["query"],
            expected_keywords=item.get("expected_keywords", []),
            topic=item.get("topic", "unknown"),
            difficulty=item.get("difficulty", "unknown"),
        )
        for item in data.get("single_turn_queries", [])
    ]

    return cases[:limit] if limit else cases


def keyword_coverage(answer: str, expected_keywords: Iterable[str]) -> tuple[float, List[str]]:
    expected = list(expected_keywords)
    answer_lower = answer.lower()
    found = [kw for kw in expected if kw.lower() in answer_lower]
    score = len(found) / len(expected) if expected else 1.0
    return score, found


def summarize_agent_metrics(per_agent: List[Dict[str, Any]]) -> tuple[int, float]:
    docs_used = sum(int(entry.get("docs_used", 0)) for entry in per_agent)
    sims = [
        float(entry.get("metrics", {}).get("avg_sim", 0.0))
        for entry in per_agent
        if entry.get("metrics")
    ]
    avg_similarity = statistics.mean(sims) if sims else 0.0
    return docs_used, avg_similarity


def run_mode(
    mode: str,
    case: QueryCase,
    client: chromadb.PersistentClient,
    embedder: SentenceTransformerEmbeddings,
    llm: LocalHeuristicLLM,
    collections_filter: Optional[List[str]],
    max_workers: int,
) -> ModeResult:
    start = time.perf_counter()
    try:
        # anti_test.py is intentionally verbose; keep benchmark output readable.
        with contextlib.redirect_stdout(io.StringIO()):
            result = orchestrate(
                query_text=case.query,
                client=client,
                embedder=embedder,
                llm=llm,
                collections_filter=collections_filter,
                max_workers=max_workers,
            )
        latency_ms = int((time.perf_counter() - start) * 1000)
        answer = result.get("answer", "")
        coverage, found = keyword_coverage(answer, case.expected_keywords)
        docs_used, avg_similarity = summarize_agent_metrics(result.get("per_agent", []))
        return ModeResult(
            mode=mode,
            query=case.query,
            topic=case.topic,
            difficulty=case.difficulty,
            latency_ms=latency_ms,
            keyword_coverage=coverage,
            found_keywords=found,
            expected_keywords=case.expected_keywords,
            docs_used=docs_used,
            avg_similarity=avg_similarity,
            collections_considered=result.get("collections_considered", []),
            per_agent_metrics=result.get("per_agent", []),
        )
    except Exception as exc:
        latency_ms = int((time.perf_counter() - start) * 1000)
        return ModeResult(
            mode=mode,
            query=case.query,
            topic=case.topic,
            difficulty=case.difficulty,
            latency_ms=latency_ms,
            keyword_coverage=0.0,
            found_keywords=[],
            expected_keywords=case.expected_keywords,
            docs_used=0,
            avg_similarity=0.0,
            collections_considered=collections_filter or [],
            per_agent_metrics=[],
            error=str(exc),
        )


def mean(values: Iterable[float]) -> float:
    values = list(values)
    return statistics.mean(values) if values else 0.0


def median(values: Iterable[float]) -> float:
    values = list(values)
    return statistics.median(values) if values else 0.0


def p95(values: Iterable[float]) -> float:
    values = sorted(values)
    if not values:
        return 0.0
    idx = min(len(values) - 1, int(round(0.95 * (len(values) - 1))))
    return values[idx]


def summarize_mode(results: List[ModeResult]) -> Dict[str, Any]:
    successful = [r for r in results if not r.error]
    failed = [r for r in results if r.error]
    latencies = [r.latency_ms for r in successful]

    return {
        "queries": len(results),
        "successful": len(successful),
        "failed": len(failed),
        "avg_latency_ms": round(mean(latencies), 2),
        "median_latency_ms": round(median(latencies), 2),
        "p95_latency_ms": round(p95(latencies), 2),
        "avg_keyword_coverage": round(mean(r.keyword_coverage for r in successful), 4),
        "avg_docs_used": round(mean(r.docs_used for r in successful), 2),
        "avg_similarity": round(mean(r.avg_similarity for r in successful), 4),
        "faiss_refined_agents": sum(
            1
            for result in successful
            for agent in result.per_agent_metrics
            if agent.get("metrics", {}).get("faiss_refined")
        ),
        "cross_encoder_reranked_agents": sum(
            1
            for result in successful
            for agent in result.per_agent_metrics
            if agent.get("metrics", {}).get("cross_encoder_reranked")
        ),
    }


def write_markdown_report(
    output_path: Path,
    summary: Dict[str, Any],
    args: argparse.Namespace,
) -> None:
    modes = summary["modes"]
    single = modes.get("single_collection_baseline", {})
    sequential = modes.get("multi_agent_sequential", {})
    parallel = modes.get("multi_agent_parallel", {})

    def pct_delta(new: float, old: float) -> float:
        if old == 0:
            return 0.0
        return ((new - old) / old) * 100

    latency_delta = pct_delta(
        parallel.get("median_latency_ms", 0.0),
        sequential.get("median_latency_ms", 0.0),
    )
    coverage_delta = pct_delta(
        parallel.get("avg_keyword_coverage", 0.0),
        single.get("avg_keyword_coverage", 0.0),
    )

    lines = [
        "# Agentic RAG Benchmark Report",
        "",
        f"Generated: {summary['generated_at']}",
        f"Dataset: `{args.dataset}`",
        f"Queries evaluated: {summary['query_count']}",
        f"Single-collection baseline: `{args.single_collection}`",
        f"Parallel workers: {args.parallel_workers}",
        "",
        "## Mode Summary",
        "",
        "| Mode | Successful | Median Latency | P95 Latency | Avg Keyword Coverage | Avg Docs Used | Avg Similarity | FAISS Agents | Cross-Encoder Agents |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]

    for mode_name, mode_summary in modes.items():
        lines.append(
            "| "
            f"{mode_name} | "
            f"{mode_summary['successful']}/{mode_summary['queries']} | "
            f"{mode_summary['median_latency_ms']} ms | "
            f"{mode_summary['p95_latency_ms']} ms | "
            f"{mode_summary['avg_keyword_coverage']:.2%} | "
            f"{mode_summary['avg_docs_used']} | "
            f"{mode_summary['avg_similarity']} | "
            f"{mode_summary['faiss_refined_agents']} | "
            f"{mode_summary['cross_encoder_reranked_agents']} |"
        )

    lines.extend(
        [
            "",
            "## Resume Interpretation",
            "",
            f"- Parallel vs sequential median latency delta: {latency_delta:.1f}%. Negative is faster.",
            f"- Multi-agent parallel vs single-collection keyword coverage delta: {coverage_delta:.1f}%.",
            "- Keyword coverage is not clinical accuracy and not precision@K.",
            "- Use these numbers only after reviewing the JSON details and confirming the benchmark setup is acceptable.",
            "",
        ]
    )

    output_path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark TrustMed-AI RAG modes")
    parser.add_argument("--dataset", default=DEFAULT_DATASET)
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--single-collection", default="diseases")
    parser.add_argument("--parallel-workers", type=int, default=4)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dataset_path = Path(args.dataset)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    cases = load_query_cases(dataset_path, args.limit)
    if not cases:
        raise RuntimeError(f"No single-turn queries found in {dataset_path}")

    client = chromadb.PersistentClient(path=os.environ.get("CHROMA_DB_DIR", CHROMA_DB_DIR))
    embedder = SentenceTransformerEmbeddings(EMBEDDING_MODEL_NAME)
    llm = LocalHeuristicLLM()

    # Warm the embedding model once so the first measured query is less distorted.
    embedder.encode(["warm up embedding model"])

    modes = [
        ("single_collection_baseline", [args.single_collection], 1),
        ("multi_agent_sequential", None, 1),
        ("multi_agent_parallel", None, args.parallel_workers),
    ]

    results: Dict[str, List[ModeResult]] = {mode[0]: [] for mode in modes}

    for idx, case in enumerate(cases, start=1):
        print(f"[{idx}/{len(cases)}] {case.query}")
        for mode_name, collections_filter, workers in modes:
            mode_result = run_mode(
                mode=mode_name,
                case=case,
                client=client,
                embedder=embedder,
                llm=llm,
                collections_filter=collections_filter,
                max_workers=workers,
            )
            results[mode_name].append(mode_result)
            status = "error" if mode_result.error else f"{mode_result.latency_ms}ms"
            print(f"  - {mode_name}: {status}")

    generated_at = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = output_dir / f"agentic_rag_benchmark_{generated_at}.json"
    md_path = output_dir / f"agentic_rag_benchmark_{generated_at}.md"

    summary = {
        "generated_at": generated_at,
        "dataset": str(dataset_path),
        "query_count": len(cases),
        "embedding_model": EMBEDDING_MODEL_NAME,
        "single_collection": args.single_collection,
        "parallel_workers": args.parallel_workers,
        "modes": {
            mode_name: summarize_mode(mode_results)
            for mode_name, mode_results in results.items()
        },
        "results": {
            mode_name: [asdict(result) for result in mode_results]
            for mode_name, mode_results in results.items()
        },
    }

    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    write_markdown_report(md_path, summary, args)

    print(f"\nWrote JSON: {json_path}")
    print(f"Wrote report: {md_path}")


if __name__ == "__main__":
    main()
