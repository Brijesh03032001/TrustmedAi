# TrustMed-AI Commit Plan

This file is a forward-looking plan for making small, meaningful commits as TrustMed-AI is improved. Each commit should represent a real, reviewable unit of work and should be pushed after verification.

The dates below are **target development dates / planned milestone dates** for organizing the project timeline. They should be used as a schedule and progress plan, not as fabricated Git commit metadata.

## Date-Based Milestone Summary

| Date | Planned commits | Focus area |
|---|---:|---|
| June 9 | 1 | Hybrid retrieval baseline and benchmark setup |
| June 10 | 3 | Retrieval documentation, API metrics, benchmark controls |
| June 11 | 1 | Precision@K evaluation design |
| June 12 | 3 | ElevenLabs backend voice service, TTS endpoint, STT endpoint |
| June 13 | 2 | Frontend microphone and listen controls |
| June 14 | 1 | Accessible voice UI state polish |
| June 16 | 1 | Expanded medical QA evaluation set |
| June 17 | 1 | Faithfulness and relevance scoring |
| June 18 | 2 | Updated evaluation report and resume claim audit |
| June 20 | 1 | Snowflake evaluation logging |
| June 21 | 1 | Tableau-ready evaluation export |
| June 24 | 1 | Full-stack README rewrite |
| June 25 | 1 | Architecture documentation |
| June 27 | 1 | Demo script and presentation talking points |

Total planned commits: 20

## Commit Rules

- Keep each commit focused on one feature, bug fix, benchmark, or documentation update.
- Do not mix frontend redesign, backend retrieval, benchmarks, and docs in the same commit.
- Run at least one relevant check before committing.
- Include generated benchmark reports only when they support a claim.
- Do not commit `.env`, virtual environments, `.next`, `node_modules`, or raw secrets.

## Phase 1: Retrieval and RAG Quality

### Commit 1

Target date:
June 9

Message:
`Add hybrid retrieval reranking benchmarks`

Purpose:
Record the existing FAISS/cross-encoder retrieval upgrade and benchmark artifacts.

Files:
- `anti_test.py`
- `requirements.txt`
- `benchmark_agentic_rag.py`
- `benchmark_results/*`
- `RESUME_CLAIM_AUDIT.md`

Checks:
- `./trustmed_env/bin/python -m py_compile anti_test.py benchmark_agentic_rag.py trustmed_api.py`
- `ENABLE_FAISS_REFINEMENT=true ENABLE_CROSS_ENCODER_RERANKING=true ./trustmed_env/bin/python benchmark_agentic_rag.py --limit 3`

Status:
Completed and pushed as `1c3a1a3`.

### Commit 2

Target date:
June 10

Message:
`Document hybrid retrieval configuration`

Purpose:
Add clear README instructions for enabling FAISS refinement and cross-encoder reranking.

Files:
- `README.md` or `TrustMed-AI/README.md`
- `RESUME_CLAIM_AUDIT.md`

Checks:
- Verify commands and environment variables are accurate.

### Commit 3

Target date:
June 10

Message:
`Add reranking metrics to API responses`

Purpose:
Expose whether FAISS and cross-encoder reranking were used in the backend response metadata.

Files:
- `trustmed_api.py`
- `src/types/index.ts`
- `src/components/chat/ChatInterface.tsx`

Checks:
- FastAPI health endpoint
- One `/medical/query` smoke test
- Frontend renders without TypeScript errors

### Commit 4

Target date:
June 10

Message:
`Add retrieval mode controls for benchmarks`

Purpose:
Make benchmark modes explicit: Chroma-only, Chroma+FAISS, Chroma+FAISS+cross-encoder.

Files:
- `benchmark_agentic_rag.py`
- `benchmark_results/*`

Checks:
- Run benchmark with `--limit 5` for each retrieval mode.

### Commit 5

Target date:
June 11

Message:
`Add precision at k evaluation`

Purpose:
Add a more defensible retrieval metric using labeled expected source collections or expected evidence terms.

Files:
- `evaluation_dataset_extended.json`
- `benchmark_agentic_rag.py`
- `benchmark_results/*`
- `RESUME_CLAIM_AUDIT.md`

Checks:
- Confirm precision@K is separate from keyword coverage.

## Phase 2: Voice Accessibility With ElevenLabs

### Commit 6

Target date:
June 12

Message:
`Add ElevenLabs voice service`

Purpose:
Create backend utility functions for text-to-speech and speech-to-text.

Files:
- `voice_service.py`
- `requirements.txt`
- `.env.example` if added

Checks:
- Import test for voice service
- No API keys committed

### Commit 7

Target date:
June 12

Message:
`Add text to speech endpoint`

Purpose:
Expose a backend endpoint that converts assistant answers into playable audio.

Files:
- `trustmed_api.py`
- `voice_service.py`

Checks:
- FastAPI docs load
- Endpoint returns audio or a clear missing-key error

### Commit 8

Target date:
June 12

Message:
`Add speech to text endpoint`

Purpose:
Expose a backend endpoint that accepts recorded audio and returns transcript text.

Files:
- `trustmed_api.py`
- `voice_service.py`

Checks:
- Endpoint accepts multipart audio upload
- Missing-key behavior is safe and clear

### Commit 9

Target date:
June 13

Message:
`Add voice controls to chat input`

Purpose:
Add microphone recording controls to the chat UI.

Files:
- `src/components/chat/ChatInterface.tsx`
- `src/lib/api.ts`
- `src/types/index.ts`

Checks:
- Browser can request microphone permission
- Recorded audio can be sent to backend

### Commit 10

Target date:
June 13

Message:
`Add listen button for assistant responses`

Purpose:
Add a speaker/play button on assistant messages that calls the TTS endpoint and plays audio.

Files:
- `src/components/chat/ChatInterface.tsx`
- `src/lib/api.ts`

Checks:
- Play, loading, and error states render cleanly.

### Commit 11

Target date:
June 14

Message:
`Improve accessible voice chat states`

Purpose:
Polish voice UI states for recording, transcribing, speaking, and errors.

Files:
- `src/components/chat/ChatInterface.tsx`
- `src/app/globals.css`

Checks:
- Mobile and desktop layout smoke test.

## Phase 3: Evaluation and Resume Evidence

### Commit 12

Target date:
June 16

Message:
`Expand medical QA evaluation set`

Purpose:
Grow the evaluation dataset toward 100 prompts while keeping categories explicit.

Files:
- `evaluation_dataset_extended.json`

Checks:
- JSON validates.

### Commit 13

Target date:
June 17

Message:
`Add faithfulness and relevance scoring`

Purpose:
Add evaluation fields beyond keyword coverage.

Files:
- `evaluate_system_comprehensive.py`
- `evaluation_dataset_extended.json`
- `benchmark_results/*`

Checks:
- Evaluation report includes faithfulness and relevance separately.

### Commit 14

Target date:
June 18

Message:
`Generate updated retrieval evaluation report`

Purpose:
Commit fresh benchmark artifacts after retrieval and evaluation upgrades.

Files:
- `benchmark_results/*`
- `comprehensive_evaluation_results_*.json`
- `comprehensive_evaluation_report_*.txt`

Checks:
- Report numbers match the resume audit.

### Commit 15

Target date:
June 18

Message:
`Update resume claim audit with verified metrics`

Purpose:
Keep the resume audit aligned with current code and benchmark evidence.

Files:
- `RESUME_CLAIM_AUDIT.md`

Checks:
- No unverified claims remain.

## Phase 4: Snowflake and Tableau Later

### Commit 16

Target date:
June 20

Message:
`Add Snowflake evaluation logger`

Purpose:
Log benchmark and evaluation results to Snowflake tables.

Files:
- `evaluation_logger.py`
- `requirements.txt`
- `README.md`

Checks:
- Logger handles missing credentials safely.

### Commit 17

Target date:
June 21

Message:
`Add Tableau ready evaluation export`

Purpose:
Create CSV or database views that Tableau can consume.

Files:
- `tableau_exports/`
- `evaluation_logger.py`
- `README.md`

Checks:
- Export contains latency, keyword coverage, retrieval mode, topic, and timestamp.

## Phase 5: Documentation and Demo Polish

### Commit 18

Target date:
June 24

Message:
`Rewrite project README for full stack demo`

Purpose:
Replace the default README with real setup, architecture, features, and benchmark documentation.

Files:
- `TrustMed-AI/README.md`

Checks:
- A new user can run backend and frontend from the README.

### Commit 19

Target date:
June 25

Message:
`Add architecture diagram and feature overview`

Purpose:
Document the full-stack flow: Next.js, FastAPI, ChromaDB, FAISS, reranker, ElevenLabs.

Files:
- `docs/architecture.md`
- `TrustMed-AI/README.md`

Checks:
- Diagram and text match implemented code.

### Commit 20

Target date:
June 27

Message:
`Add demo script and talking points`

Purpose:
Create a short demo checklist for class presentation or resume discussion.

Files:
- `docs/demo_script.md`

Checks:
- Demo steps work with local app.

## Suggested Commit Cadence

Use one commit per completed unit. A healthy sequence could include 20-30 meaningful commits across retrieval, voice accessibility, evaluation, analytics, and documentation. More commits are fine only if they represent real incremental changes.
