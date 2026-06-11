# Retrieval Precision Report

Generated: 20260711_063319
Dataset: `evaluation_dataset_100.json`
Queries evaluated: 3
Embedding model: `sentence-transformers/all-MiniLM-L6-v2`

## Overall Metrics

| Metric | Value |
|---|---:|
| avg_p@1 | 100.00% |
| avg_p@3 | 100.00% |
| avg_p@5 | 100.00% |
| avg_p@10 | 100.00% |
| hit_rate@1 | 100.00% |
| hit_rate@3 | 100.00% |
| hit_rate@5 | 100.00% |
| hit_rate@10 | 100.00% |
| mean_reciprocal_rank | 1.0000 |

## Domain Breakdown

| Domain | P@3 | P@5 | MRR |
|---|---:|---:|---:|
| endocrine_metabolic | 100.00% | 100.00% | 1.0000 |

## Interpretation

- Precision@K is computed before answer generation, using Chroma retrieval results.
- A chunk is considered relevant when it matches the expected collection and topic/keyword signals, or when it has strong keyword overlap.
- This is a retrieval-quality benchmark, not a clinical safety or diagnostic accuracy benchmark.