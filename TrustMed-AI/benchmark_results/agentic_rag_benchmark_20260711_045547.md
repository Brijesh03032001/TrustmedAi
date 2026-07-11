# Agentic RAG Benchmark Report

Generated: 20260711_045547
Dataset: `evaluation_dataset_extended.json`
Queries evaluated: 15
Single-collection baseline: `diseases`
Parallel workers: 4

## Mode Summary

| Mode | Successful | Median Latency | P95 Latency | Avg Keyword Coverage | Avg Docs Used | Avg Similarity |
|---|---:|---:|---:|---:|---:|---:|
| single_collection_baseline | 15/15 | 53 ms | 288 ms | 12.00% | 0.93 | 0.5256 |
| multi_agent_sequential | 15/15 | 106 ms | 140 ms | 44.67% | 3.33 | 0.424 |
| multi_agent_parallel | 15/15 | 79 ms | 85 ms | 44.67% | 3.33 | 0.424 |

## Resume Interpretation

- Parallel vs sequential median latency delta: -25.5%. Negative is faster.
- Multi-agent parallel vs single-collection keyword coverage delta: 272.2%.
- Keyword coverage is not clinical accuracy and not precision@K.
- Use these numbers only after reviewing the JSON details and confirming the benchmark setup is acceptable.
