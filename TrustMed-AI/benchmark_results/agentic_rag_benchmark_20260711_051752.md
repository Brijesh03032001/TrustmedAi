# Agentic RAG Benchmark Report

Generated: 20260711_051752
Dataset: `evaluation_dataset_extended.json`
Queries evaluated: 3
Single-collection baseline: `diseases`
Parallel workers: 4

## Mode Summary

| Mode | Successful | Median Latency | P95 Latency | Avg Keyword Coverage | Avg Docs Used | Avg Similarity |
|---|---:|---:|---:|---:|---:|---:|
| single_collection_baseline | 3/3 | 549 ms | 11978 ms | 6.67% | 1.33 | 0.3928 |
| multi_agent_sequential | 3/3 | 947 ms | 1023 ms | 75.00% | 6.67 | 0.4152 |
| multi_agent_parallel | 3/3 | 291 ms | 307 ms | 75.00% | 6.67 | 0.4152 |

## Resume Interpretation

- Parallel vs sequential median latency delta: -69.3%. Negative is faster.
- Multi-agent parallel vs single-collection keyword coverage delta: 1024.4%.
- Keyword coverage is not clinical accuracy and not precision@K.
- Use these numbers only after reviewing the JSON details and confirming the benchmark setup is acceptable.
