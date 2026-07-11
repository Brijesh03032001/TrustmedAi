# Agentic RAG Benchmark Report

Generated: 20260711_051720
Dataset: `evaluation_dataset_extended.json`
Queries evaluated: 3
Single-collection baseline: `diseases`
Parallel workers: 4

## Mode Summary

| Mode | Successful | Median Latency | P95 Latency | Avg Keyword Coverage | Avg Docs Used | Avg Similarity |
|---|---:|---:|---:|---:|---:|---:|
| single_collection_baseline | 3/3 | 102 ms | 308 ms | 6.67% | 1.33 | 0.3928 |
| multi_agent_sequential | 3/3 | 181 ms | 428 ms | 83.33% | 7.67 | 0.4158 |
| multi_agent_parallel | 3/3 | 98 ms | 99 ms | 83.33% | 7.67 | 0.4158 |

## Resume Interpretation

- Parallel vs sequential median latency delta: -45.9%. Negative is faster.
- Multi-agent parallel vs single-collection keyword coverage delta: 1149.3%.
- Keyword coverage is not clinical accuracy and not precision@K.
- Use these numbers only after reviewing the JSON details and confirming the benchmark setup is acceptable.
