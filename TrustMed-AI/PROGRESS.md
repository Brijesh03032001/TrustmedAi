# TrustMed-AI Progress Log

Last updated: July 11, 2026

This file summarizes the concrete project work completed so far, the files changed or added, and which resume/project claims are now supported by the codebase.

## Completed Work

### 1. Resume Claim Audit

Added a project audit document to separate strong, partially supported, and unsupported resume claims.

Files:

- `RESUME_CLAIM_AUDIT.md`

Coverage:

- Identifies which claims are already backed by code.
- Flags claims that need benchmark evidence.
- Separates real implementation from planned or incomplete work.

### 2. Agentic RAG Benchmarking

Added a benchmark script that compares baseline retrieval, sequential multi-agent retrieval, and parallel multi-agent retrieval.

Files:

- `benchmark_agentic_rag.py`
- `benchmark_results/agentic_rag_benchmark_*.json`
- `benchmark_results/agentic_rag_benchmark_*.md`

Coverage:

- Multi-agent RAG framework.
- Parallelized agents with `ThreadPoolExecutor`.
- Latency comparison across execution modes.
- Keyword coverage and per-agent retrieval metrics.
- FAISS and cross-encoder usage counts in reports.

### 3. FAISS Refinement and Cross-Encoder Reranking

Enhanced the RAG orchestrator with optional FAISS refinement and cross-encoder reranking.

Files:

- `anti_test.py`
- `requirements.txt`

Coverage:

- FAISS candidate refinement.
- Cross-encoder reranking.
- Per-agent metrics showing:
  - `faiss_refined`
  - `cross_encoder_reranked`
  - `cross_encoder_model`
  - `cross_encoder_top_score`

How to enable:

```bash
ENABLE_FAISS_REFINEMENT=true
ENABLE_CROSS_ENCODER_RERANKING=true
CROSS_ENCODER_TOP_N=8
```

### 4. ReAct-Style Query Planning

Added a lightweight ReAct-style routing layer that explains how the backend chooses retrieval actions.

Files:

- `react_router.py`
- `trustmed_api.py`
- `src/types/index.ts`
- `src/lib/api.ts`
- `src/components/chat/ChatInterface.tsx`

Coverage:

- ReAct-style trace with:
  - Thought
  - Action
  - Observation
- Query routing across medical collections.
- API response includes `react_trace`.
- Frontend can display the trace in the chat UI.

Note:

- This is ReAct-style routing/planning, not a fully autonomous tool-using LangChain ReAct agent.

### 5. ElevenLabs Voice Features

Added voice accessibility features using ElevenLabs.

Files:

- `voice_service.py`
- `trustmed_api.py`
- `src/lib/api.ts`
- `src/components/chat/ChatInterface.tsx`
- `.env` local configuration

Coverage:

- Text-to-speech endpoint.
- Speech-to-text endpoint.
- Frontend support for speaking and listening workflows.
- Voice ID configured locally through `.env`.

Endpoints:

```text
POST /voice/text-to-speech
POST /voice/speech-to-text
```

Security note:

- API keys should remain only in `.env`.
- Do not commit `.env`.

### 6. 100-Prompt Evaluation Dataset

Added a larger evaluation dataset with 100 prompts across five medical domains.

Files:

- `evaluation_dataset_100.json`

Coverage:

- 100-prompt evaluation suite.
- Five medical domains:
  - endocrine/metabolic
  - cardiovascular
  - respiratory/allergy
  - neurology/mental health
  - musculoskeletal/infectious/general
- Each prompt includes:
  - query
  - expected keywords
  - expected collections
  - topic
  - domain
  - difficulty

### 7. Precision@K Retrieval Evaluation

Added a retrieval-specific evaluator for real precision@K and MRR measurement.

Files:

- `evaluate_retrieval_precision.py`
- `benchmark_results/retrieval_precision_*.json`
- `benchmark_results/retrieval_precision_*.md`

Coverage:

- Precision@K.
- Collection hit rate.
- Mean reciprocal rank.
- Domain-level retrieval breakdown.
- ChromaDB retrieval evaluation before answer generation.

Command:

```bash
python evaluate_retrieval_precision.py --dataset evaluation_dataset_100.json
```

### 8. Faithfulness and Hallucination-Risk Evaluation

Added a grounding evaluator to track whether generated answers are citation-backed and avoid risky unsupported wording.

Files:

- `evaluate_faithfulness.py`
- `benchmark_results/faithfulness_*.json`
- `benchmark_results/faithfulness_*.md`

Coverage:

- Citation rate.
- Link rate.
- Retrieved docs used.
- Expected keyword coverage.
- Risky phrase detection.
- Safety-language detection.
- Grounded score.

Command:

```bash
python evaluate_faithfulness.py --dataset evaluation_dataset_100.json
```

Note:

- This is a heuristic hallucination-risk evaluator, not clinical validation.

### 9. Polished README

Replaced the default Next.js README with a full project README.

Files:

- `README.md`

Coverage:

- Project overview.
- Full-stack architecture diagram.
- Tech stack.
- Repository map.
- Environment variables.
- Backend and frontend setup.
- API endpoints.
- Evaluation commands.
- Resume-safe claim examples.
- Demo flow.
- Limitations and medical disclaimer.

### 10. Commit Planning Document

Added a planning document for organizing future commits and project milestones.

Files:

- `COMMIT_PLAN.md`

Coverage:

- Suggested feature milestones.
- Suggested commit grouping.
- Date-based planning for school/project tracking.

### 11. Three.js GLB Robot Avatar

Added a 3D robot avatar to the chatbot using the user-provided GLB model.

Files:

- `public/models/robotBlueeyes.glb`
- `src/components/chat/RobotAvatar3D.tsx`
- `src/components/chat/ChatInterface.tsx`
- `package.json`
- `package-lock.json`

Coverage:

- Installed Three.js frontend dependencies:
  - `three`
  - `@react-three/fiber`
  - `@react-three/drei`
- Loaded the GLB robot model from `public/models/robotBlueeyes.glb`.
- Added the robot to the chat header.
- Added the robot to the empty chatbot welcome screen.
- Added the robot directly inside the chat input text field.
- Added procedural animation states:
  - `idle`
  - `thinking`
  - `speaking`
  - `recording`
- Connected robot animation state to chatbot behavior:
  - backend response pending -> thinking animation
  - ElevenLabs audio playing -> speaking animation
  - microphone recording/transcribing -> recording animation
  - normal state -> idle animation

Inspection result:

- The GLB contains a static mesh.
- It has no embedded animation clips.
- It has no bones/skins.
- It has no morph targets.
- Because of this, animation is implemented procedurally with Three.js transforms, glow, pulsing, bobbing, and halo motion.

### 12. Doctor Avatar and Premium Chat UI

Reworked the main chat experience around a compressed doctor GLB model and a more polished medical assistant interface.

Files:

- `public/models/doctor-compressed.glb`
- `src/components/chat/DoctorAvatar3D.tsx`
- `src/components/chat/ChatInterface.tsx`
- `src/components/ui/text-generate-effect.tsx`
- `src/lib/utils.ts`

Coverage:

- Added a compressed local doctor GLB for browser-safe rendering.
- Added a large interactive doctor avatar on the empty chat screen.
- Enabled rotate and zoom controls for inspecting the hero doctor model.
- Kept a smaller procedural doctor avatar above the input once chat starts.
- Added local word-by-word generated answer rendering to mimic ChatGPT/Perplexity response flow.
- Delayed sources and metadata until generated text finishes.
- Improved source cards, confidence chips, copy/listen controls, and demo response preview.
- Removed the ReAct trace from the patient-facing chat card while keeping it available in API responses.

### 13. Search, Disease Browser, and Sidebar Polish

Upgraded the supporting UI surfaces so the full app feels consistent with the main chat experience.

Files:

- `src/components/layout/AppLayout.tsx`
- `src/components/search/SearchPanel.tsx`
- `src/components/diseases/DiseasesBrowser.tsx`

Coverage:

- Added animated light medical-grid backgrounds.
- Added glass-style panels and rounded icon treatments.
- Added smoother hover, lift, and glow states for navigation, search results, and disease cards.
- Replaced the older sidebar disclaimer block with a cleaner RAG assistant quality card.
- Improved visual consistency across chat, search, and disease database routes.

## Resume Claims Currently Covered

These claims now have code or report support in the repository:

- Built a full-stack medical AI assistant with Next.js and FastAPI.
- Designed an agentic RAG backend across symptoms, diseases, and medicines collections.
- Used ChromaDB as the persistent vector database.
- Used sentence-transformer embeddings for retrieval.
- Added optional FAISS refinement.
- Added optional cross-encoder reranking.
- Parallelized retrieval agents using `ThreadPoolExecutor`.
- Added ReAct-style query planning and explainability trace.
- Integrated ElevenLabs text-to-speech.
- Integrated ElevenLabs speech-to-text.
- Integrated Three.js GLB avatars into the chatbot UI.
- Added an interactive doctor model on the chat welcome screen.
- Added procedural avatar animation for idle, thinking, speaking, and recording states.
- Created a 100-prompt evaluation suite.
- Added precision@K retrieval evaluation.
- Added faithfulness and hallucination-risk evaluation.
- Generated benchmark reports in JSON and Markdown.

## Claims That Need Careful Wording

These are partially supported, but should not be overstated:

- "Reduced hallucinations 65%"
  - Current support: faithfulness and hallucination-risk evaluator exists.
  - Still needed: before/after benchmark comparing reranking disabled vs enabled.

- "Achieved 91% accuracy"
  - Current support: evaluation framework exists.
  - Still needed: full benchmark run with a clearly defined accuracy metric.

- "0.89 precision on clinical QA benchmarks"
  - Current support: precision@K evaluator exists.
  - Still needed: run the full 100-prompt suite and use the actual result.

- "Privacy-preserving patient-data pipeline"
  - Current support: no patient data is required for the current vector store.
  - Better wording: "Designed the RAG index around public/curated medical content and avoided storing raw patient records."

- "Docker + AWS deployment"
  - Current support: deployment was intentionally not worked on in this pass.
  - Do not claim deployed unless separately completed and verified.

- "Snowflake/Tableau evaluation logging"
  - Current support: not implemented yet.
  - Can be added later as an evaluation export/logging layer.

## Recommended Next Steps

1. Run the full 100-prompt retrieval precision evaluation.
2. Run the full 100-prompt faithfulness evaluation.
3. Run faithfulness twice:
   - once with reranking disabled
   - once with FAISS + cross-encoder enabled
4. Compare the before/after reports to support a hallucination-reduction claim.
5. Add Snowflake/Tableau only after the core metrics are stable.
6. Update resume bullets using only the final measured numbers.

## Useful Commands

Backend:

```bash
cd TrustMed-AI
source trustmed_env/bin/activate
ENABLE_FAISS_REFINEMENT=true \
ENABLE_CROSS_ENCODER_RERANKING=true \
CROSS_ENCODER_TOP_N=8 \
python -m uvicorn trustmed_api:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd TrustMed-AI
npm run dev
```

Evaluation:

```bash
cd TrustMed-AI
source trustmed_env/bin/activate
python evaluate_retrieval_precision.py --dataset evaluation_dataset_100.json
python evaluate_faithfulness.py --dataset evaluation_dataset_100.json
```
