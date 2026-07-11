# TrustMed-AI Resume Claim Audit

This tracker separates what the repository currently proves from what still needs code, measurement, or softer wording. Deployment/AWS is intentionally excluded for now.

## Claim 1: Multi-Agent RAG Framework

Original claim:
Designed a multi-agent RAG framework for complex medical question answering, raising retrieval precision 40% over single-agent baseline LLM approaches.

Current evidence:
- `anti_test.py` creates one retrieval agent per Chroma collection and runs those agents through a shared orchestrator.
- The active Chroma store has three domain collections: `symptoms`, `medicines`, and `diseases`.
- Each agent performs cosine-similarity retrieval, threshold-based document selection, metadata vetting, summarization, confidence scoring, and citation capture.
- The orchestrator ranks agent outputs by utility and merges them into one final answer.
- `benchmark_agentic_rag.py` now compares a single-collection `diseases` baseline against multi-agent retrieval over all three collections.
- Latest benchmark artifact: `benchmark_results/agentic_rag_benchmark_20260711_045547.md`.
- On 15 single-turn evaluation queries, multi-agent parallel mode improved average keyword coverage from 12.00% to 44.67% versus the `diseases`-only baseline.

Current risk:
- "Multi-agent" is defensible only if framed as collection-specialized retrieval agents, not autonomous planner/tool agents.
- The repository now has a single-collection baseline, but it measures answer keyword coverage, not retrieval precision@K.
- The measured improvement is not the same as the original "+40% retrieval precision" claim.

Resume-safe wording today:
- Built a collection-specialized RAG orchestrator over ChromaDB, routing medical questions across symptoms, medicines, and diseases retrieval agents with citation-aware response aggregation.
- Benchmarked multi-agent retrieval against a single-collection baseline, improving answer keyword coverage from 12.00% to 44.67% across 15 medical QA prompts.

To make the original claim defensible:
- Define the retrieval precision metric clearly, such as keyword hit rate, expected source collection hit rate, or human-labeled relevance at K.
- Save benchmark outputs as JSON and a short report.

## Claim 2: Parallelized Agents and Latency Reduction

Original claim:
Parallelized LLM agents using ThreadPoolExecutor and utility-based weighting, cutting median response latency from 12 seconds to 4 seconds.

Current evidence:
- `anti_test.py` uses `ThreadPoolExecutor` to execute collection agents concurrently.
- Agent outputs are sorted using the `utility(...)` score before final aggregation.
- `benchmark_agentic_rag.py` compares `multi_agent_sequential` (`max_workers=1`) against `multi_agent_parallel` (`max_workers=4`).
- Latest benchmark artifact: `benchmark_results/agentic_rag_benchmark_20260711_045547.md`.
- On 15 warm-cache, heuristic-LLM benchmark queries, median latency improved from 106 ms sequential to 79 ms parallel, a 25.5% reduction.

Current risk:
- The committed comprehensive evaluation report shows median latency around 24.8 seconds, not 4 seconds.
- LLM calls and model loading can dominate latency, so any timing claim needs a reproducible script and warm-cache runs.
- The new benchmark intentionally excludes OpenAI latency by using `LocalHeuristicLLM`; it measures local RAG orchestration latency, not full production LLM latency.

Resume-safe wording today:
- Parallelized collection-level RAG retrieval with `ThreadPoolExecutor` and utility-based output ranking across three medical knowledge collections.
- Benchmarked parallel RAG orchestration against sequential execution, reducing warm-cache median local orchestration latency by 25.5% across 15 medical QA prompts.

To make a latency claim defensible:
- Report median, p95, and average latency over the same query set.
- Use the measured numbers, even if they are less flashy than 12s to 4s.

## Claim 3: ChromaDB Embedding Retrieval Precision

Original claim:
Tuned sentence-embedding retrieval on ChromaDB with cosine similarity scoring, achieving 0.89 precision on clinical QA benchmarks.

Current evidence:
- `sql_to_chroma.py` uses `sentence-transformers/all-MiniLM-L6-v2`.
- Chroma collections are configured with cosine space.
- The evaluation suite tracks average similarity, docs used, and keyword match.

Current risk:
- Existing report shows average similarity around 0.451, not 0.89 precision.
- The current evaluator does not calculate precision@K against labeled relevant documents.

Resume-safe wording today:
- Implemented cosine-similarity retrieval in ChromaDB with sentence-transformer embeddings and metadata-aware filtering over 9K+ medical document chunks.

To make precision defensible:
- Add labeled expected collections or expected source documents per query.
- Compute precision@K and recall@K separately from answer keyword match.

## Claim 4: FAISS + Cross-Encoder Reranking Privacy Pipeline

Original claim:
Built a privacy-preserving RAG-LLM pipeline with FAISS and cross-encoder reranking, ensuring no raw patient data entered the vector index, reducing hallucinations 65%.

Current evidence:
- Main app uses ChromaDB as the persistent vector store and metadata layer.
- `anti_test.py` now supports optional FAISS candidate refinement through `ENABLE_FAISS_REFINEMENT=true`.
- `anti_test.py` now supports optional cross-encoder evidence reranking through `ENABLE_CROSS_ENCODER_RERANKING=true`.
- Default reranker model is `cross-encoder/ms-marco-MiniLM-L-6-v2`.
- Public medical knowledge appears to be indexed, not raw patient data.
- Enhanced benchmark artifact: `benchmark_results/agentic_rag_benchmark_20260711_052025.md`.
- In the enhanced 3-query smoke benchmark, the multi-agent parallel path used FAISS refinement in 9 agent runs and cross-encoder reranking in 6 agent runs.

Current risk:
- No hallucination metric or 65% reduction experiment found.
- FAISS is currently used as an in-memory refinement/reranking stage over Chroma candidates, not as the primary persistent vector database.
- Cross-encoder reranking is optional and disabled by default to avoid startup/download cost.

Resume-safe wording today:
- Built a hybrid retrieval pipeline over public medical reference content, combining ChromaDB candidate retrieval with optional FAISS vector refinement and cross-encoder reranking before source-linked answer generation.

To make the original claim defensible:
- Decide whether the resume should say "FAISS refinement" or "FAISS index"; current implementation is refinement over Chroma candidates.
- Add hallucination/faithfulness evaluation before and after reranking.

## Claim 5: 91% MedQA-Style Accuracy

Original claim:
Achieved 91% accuracy on a MedQA-style benchmark evaluation suite spanning multiple medical specialties.

Current evidence:
- The project has a 34-query evaluation suite across topics and conversational flows.
- The report tracks keyword match, retrieval similarity, context rewrite accuracy, latency, and edge cases.

Current risk:
- No MedQA-style multiple-choice or clinically labeled benchmark found.
- Existing report does not show 91% accuracy.

Resume-safe wording today:
- Built a 34-query medical QA evaluation harness spanning single-turn, conversational, and edge-case prompts across multiple clinical topics.

To make the original claim defensible:
- Add a MedQA-style dataset with ground-truth answers.
- Compute exact accuracy and save result artifacts.

## Claim 6: Multimodal Output with TTS and 3D Avatar

Original claim:
Integrated multimodal output combining LLM text generation, text-to-speech synthesis, and 3D avatar animation using Three.js for accessible patient communication.

Current evidence:
- The frontend has a chat UI and avatar-like visual elements/icons.

Current risk:
- No `three` dependency, Three.js scene, browser TTS, or speech synthesis flow found.

Resume-safe wording today:
- Built a clinician-facing chat UI with source-linked medical answers and assistant/user conversation states.

To make the original claim defensible:
- Add browser text-to-speech controls.
- Add an actual Three.js avatar or remove Three.js from the claim.

## Claim 7: 100-Prompt Evaluation Suite

Original claim:
Designed a 100-prompt evaluation suite tracking precision, faithfulness, and relevance across 5 medical domains with iterative prompt tuning.

Current evidence:
- `evaluation_dataset_extended.json` contains 15 single-turn queries, 16 conversational turns, and 3 edge cases.
- `evaluate_system_comprehensive.py` generates JSON and text reports.

Current risk:
- Current suite has 34 evaluated prompts/turns, not 100.
- Faithfulness and relevance are not separately scored.

Resume-safe wording today:
- Designed a 34-query evaluation suite tracking keyword coverage, retrieval similarity, context rewriting, and latency across medical QA scenarios.

To make the original claim defensible:
- Expand the dataset to 100 prompts.
- Add explicit faithfulness and relevance scoring.

## Claim 8: FastAPI Backend Orchestration Layer

Original claim:
Built the backend orchestration layer in FastAPI, handling agent routing, retries, and response aggregation across the multi-agent system.

Current evidence:
- `trustmed_api.py` exposes FastAPI endpoints and calls the RAG orchestrator.
- It handles query contextualization, response aggregation, source links, confidence, source count, and response timing.

Current risk:
- Retries are not clearly implemented for failed agents or LLM calls.

Resume-safe wording today:
- Built a FastAPI backend that routes medical queries through a Chroma-backed RAG orchestrator and returns aggregated answers with source links, confidence, and latency metadata.

To make the original claim defensible:
- Add explicit retry handling around agent execution and LLM calls.

## Claim 9: Chunking Strategy and Embedding Model Selection

Original claim:
Iterated on chunking strategy and embedding model selection to reduce retrieval noise in long clinical documents.

Current evidence:
- `sql_to_chroma.py` has overlapping character chunking with `MAX_CHARS_PER_CHUNK = 2000` and `CHUNK_OVERLAP = 200`.
- The embedding model is configurable through `EMBEDDING_MODEL_NAME`.

Current risk:
- No committed experiment comparing chunk sizes or embedding models.

Resume-safe wording today:
- Implemented overlapping chunking and configurable sentence-transformer embeddings to index long medical documents in ChromaDB.

To make the original claim defensible:
- Add a chunking/model ablation script and save comparison results.

## Claim 10: Snowflake/Tableau Evaluation Logging

Original claim:
Logged the 100-prompt evaluation suite results into Snowflake and visualized precision trends in Tableau for clinical stakeholders.

Current evidence:
- No Snowflake or Tableau integration found.

Current risk:
- Not defensible from this repository.

Resume-safe wording today:
- Exported evaluation results to JSON/text reports for review.

To make the original claim defensible:
- Add Snowflake logging code or remove this claim.
- Add Tableau workbook/export evidence or remove this claim.
