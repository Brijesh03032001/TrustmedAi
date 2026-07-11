# Agentic RAG Benchmark Report

Generated: 20260711_052025
Dataset: `evaluation_dataset_extended.json`
Queries evaluated: 3
Single-collection baseline: `diseases`
Parallel workers: 4

## Mode Summary

| Mode | Successful | Median Latency | P95 Latency | Avg Keyword Coverage | Avg Docs Used | Avg Similarity | FAISS Agents | Cross-Encoder Agents |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| single_collection_baseline | 3/3 | 223 ms | 3852 ms | 6.67% | 1.33 | 0.3928 | 3 | 2 |
| multi_agent_sequential | 3/3 | 536 ms | 721 ms | 75.00% | 6.67 | 0.4152 | 9 | 6 |
| multi_agent_parallel | 3/3 | 291 ms | 384 ms | 75.00% | 6.67 | 0.4152 | 9 | 6 |

## Resume Interpretation

- Parallel vs sequential median latency delta: -45.7%. Negative is faster.
- Multi-agent parallel vs single-collection keyword coverage delta: 1024.4%.
- Keyword coverage is not clinical accuracy and not precision@K.
- Use these numbers only after reviewing the JSON details and confirming the benchmark setup is acceptable.
