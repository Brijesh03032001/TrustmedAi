#!/usr/bin/env python3
"""
TrustMed-AI FastAPI Application
Advanced Medical Information API with AI-powered responses using anti_test.py orchestration
"""

import os
import time
from datetime import datetime
from typing import List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import our enhanced medical AI system
from anti_test import (
    orchestrate,
    build_llm_provider,
    SentenceTransformerEmbeddings,
    ChatSession,
)
import chromadb

# Initialize FastAPI app
app = FastAPI(
    title="TrustMed-AI API",
    description="Advanced Medical Information API with AI-powered responses",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Configurations
CHROMA_DB_DIR = os.environ.get("CHROMA_DB_DIR", "./chroma_db")
CHAT_HISTORY_FILE = os.environ.get("CHAT_HISTORY_FILE", "./chat_history.json")

# Initialize AI components
embedder = SentenceTransformerEmbeddings()
llm_provider = build_llm_provider()
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
chat_session = ChatSession(CHAT_HISTORY_FILE)


# Pydantic Models
class MedicalQuery(BaseModel):
    query: str = Field(
        ..., description="Medical question", min_length=3, max_length=500
    )


class MedicalLink(BaseModel):
    title: str = Field(..., description="Resource title")
    url: str = Field(..., description="Resource URL")
    source_type: str = Field(
        default="general",
        description="Source type: medicine, symptoms, diseases, or general",
    )
    relevance_score: float = Field(default=0.0, description="Relevance score")


class MedicalResponse(BaseModel):
    query: str = Field(..., description="Original query")
    answer: str = Field(..., description="Focused medical response")
    links: List[MedicalLink] = Field(..., description="Medical resource links")
    query_intent: str = Field(..., description="Detected intent")
    confidence_score: float = Field(..., description="AI confidence (0-1)")
    response_time_ms: int = Field(..., description="Response time in ms")
    sources_count: int = Field(..., description="Documents analyzed")
    timestamp: str = Field(..., description="Response timestamp")


class DiseaseInfo(BaseModel):
    name: str = Field(..., description="Disease name")
    category: str = Field(..., description="Disease category")
    description: str = Field(..., description="Brief description")


class DiseasesResponse(BaseModel):
    total_diseases: int = Field(..., description="Total number of diseases")
    diseases: List[DiseaseInfo] = Field(..., description="List of diseases")
    query: Optional[str] = Field(None, description="Search query used")
    search_time_ms: int = Field(..., description="Search time in milliseconds")


class HealthCheck(BaseModel):
    status: str
    timestamp: str
    version: str
    ai_provider: str
    chroma_collections: List[str]


# Utility Functions
def detect_query_intent(query: str) -> str:
    query_lower = query.lower()
    intent_keywords = {
        "symptoms": ["symptom", "sign", "indication", "feel", "experience"],
        "causes": ["cause", "reason", "why", "trigger", "factor"],
        "diagnosis": ["diagnos", "test", "detect", "identify", "examine"],
        "treatment": ["treat", "therapy", "medicine", "medication", "manage"],
        "prevention": ["prevent", "avoid", "reduce risk", "lifestyle"],
    }

    for intent, keywords in intent_keywords.items():
        if any(keyword in query_lower for keyword in keywords):
            return intent
    return "general"


def extract_diseases_from_chroma(
    chroma_client: chromadb.PersistentClient,
) -> List[DiseaseInfo]:
    """Extract all diseases from ChromaDB collections using metadata"""
    diseases = []
    seen_names = set()  # Prevent duplicates

    try:
        # Get diseases collection
        diseases_collection = chroma_client.get_collection("diseases")

        # Get all documents from diseases collection with metadata
        results = diseases_collection.get(include=["documents", "metadatas"])

        if results and results["documents"]:
            for i, doc in enumerate(results["documents"]):
                metadata = results["metadatas"][i] if results["metadatas"] else {}

                # Extract disease name from metadata (this is the clean source)
                disease_name = metadata.get("disease_name")

                # Skip if no disease name in metadata or if duplicate
                if not disease_name or disease_name in seen_names:
                    continue

                seen_names.add(disease_name)

                # Get category from metadata or infer from content and name
                category = metadata.get("category", "general")
                if not category or category == "general":
                    name_lower = disease_name.lower()
                    doc_lower = doc.lower()

                    if any(
                        term in name_lower
                        for term in [
                            "heart",
                            "cardiac",
                            "cardiovascular",
                            "aortic",
                            "artery",
                            "hypertension",
                            "blood pressure",
                        ]
                    ):
                        category = "cardiovascular"
                    elif any(
                        term in name_lower
                        for term in [
                            "diabetes",
                            "blood sugar",
                            "insulin",
                            "thyroid",
                            "hormone",
                        ]
                    ):
                        category = "endocrine"
                    elif any(
                        term in name_lower
                        for term in [
                            "cancer",
                            "tumor",
                            "malignant",
                            "carcinoma",
                            "lymphoma",
                            "leukemia",
                        ]
                    ):
                        category = "oncology"
                    elif any(
                        term in name_lower
                        for term in [
                            "infection",
                            "bacteria",
                            "virus",
                            "flu",
                            "pneumonia",
                            "hepatitis",
                        ]
                    ):
                        category = "infectious"
                    elif any(
                        term in name_lower
                        for term in [
                            "depression",
                            "anxiety",
                            "mental",
                            "psychiatric",
                            "bipolar",
                            "adhd",
                        ]
                    ):
                        category = "mental_health"
                    elif any(
                        term in name_lower
                        for term in [
                            "uterine",
                            "ovarian",
                            "cervical",
                            "breast",
                            "pregnancy",
                            "menstrual",
                        ]
                    ):
                        category = "gynecological"
                    elif any(
                        term in name_lower
                        for term in [
                            "lung",
                            "respiratory",
                            "asthma",
                            "bronchitis",
                            "breathing",
                        ]
                    ):
                        category = "respiratory"
                    elif any(
                        term in name_lower
                        for term in [
                            "brain",
                            "neurological",
                            "alzheimer",
                            "parkinson",
                            "stroke",
                            "epilepsy",
                        ]
                    ):
                        category = "neurological"
                    elif any(
                        term in name_lower
                        for term in [
                            "bone",
                            "joint",
                            "arthritis",
                            "osteoporosis",
                            "muscle",
                            "back pain",
                        ]
                    ):
                        category = "musculoskeletal"
                    elif any(
                        term in name_lower
                        for term in ["kidney", "renal", "bladder", "urinary"]
                    ):
                        category = "urological"
                    elif any(
                        term in name_lower
                        for term in [
                            "skin",
                            "dermatitis",
                            "eczema",
                            "psoriasis",
                            "rash",
                        ]
                    ):
                        category = "dermatological"
                    elif any(
                        term in name_lower
                        for term in ["eye", "vision", "glaucoma", "cataract", "retina"]
                    ):
                        category = "ophthalmological"
                    else:
                        # Try to infer from document content
                        if any(
                            term in doc_lower
                            for term in ["heart", "cardiac", "blood pressure"]
                        ):
                            category = "cardiovascular"
                        elif any(
                            term in doc_lower
                            for term in ["diabetes", "insulin", "blood sugar"]
                        ):
                            category = "endocrine"
                        elif any(
                            term in doc_lower
                            for term in ["cancer", "tumor", "malignant"]
                        ):
                            category = "oncology"
                        else:
                            category = "general"

                # Create description from document content
                description = "Medical condition information available."

                # Look for description in the document
                lines = doc.split("\n")
                description_found = False

                for j, line in enumerate(lines):
                    line = line.strip()
                    # Look for description section or first meaningful content
                    if "Description:" in line and j + 1 < len(lines):
                        desc_line = lines[j + 1].strip()
                        if desc_line and len(desc_line) > 20:
                            description = desc_line[:200]
                            if len(desc_line) > 200:
                                description += "..."
                            description_found = True
                            break
                    elif (
                        line.startswith(disease_name)
                        and len(line) > len(disease_name) + 10
                        and not line.startswith("Name:")
                    ):
                        # Found a line that starts with disease name and has description
                        desc = line[len(disease_name) :].strip(" .:-")
                        if desc and len(desc) > 10:
                            description = desc[:200]
                            if len(desc) > 200:
                                description += "..."
                            description_found = True
                            break

                # If no specific description found, extract from first meaningful paragraph
                if not description_found:
                    paragraphs = [p.strip() for p in doc.split("\n\n") if p.strip()]
                    for para in paragraphs:
                        # Skip headers and short lines
                        if (
                            len(para) > 50
                            and not para.startswith("Name:")
                            and not para.startswith("URL:")
                            and not para.startswith("Table:")
                            and not para.startswith("•")
                            and "http" not in para
                        ):
                            description = para[:200]
                            if len(para) > 200:
                                description += "..."
                            break

                diseases.append(
                    DiseaseInfo(
                        name=disease_name, category=category, description=description
                    )
                )

    except Exception as e:
        print(f"Error extracting diseases from ChromaDB: {e}")
        # Enhanced fallback diseases list with more categories
        fallback_diseases = [
            DiseaseInfo(
                name="Diabetes Type 1",
                category="endocrine",
                description="Autoimmune condition where the pancreas produces little or no insulin.",
            ),
            DiseaseInfo(
                name="Diabetes Type 2",
                category="endocrine",
                description="Metabolic disorder characterized by high blood sugar and insulin resistance.",
            ),
            DiseaseInfo(
                name="Hypertension",
                category="cardiovascular",
                description="Persistent high blood pressure that can lead to serious health complications.",
            ),
            DiseaseInfo(
                name="Heart Disease",
                category="cardiovascular",
                description="Various conditions affecting the heart muscle, valves, or blood vessels.",
            ),
            DiseaseInfo(
                name="Breast Cancer",
                category="oncology",
                description="Malignant tumor that develops in breast tissue cells.",
            ),
            DiseaseInfo(
                name="Lung Cancer",
                category="oncology",
                description="Cancer that begins in the lungs and may spread to other parts of the body.",
            ),
            DiseaseInfo(
                name="Depression",
                category="mental_health",
                description="Mental health disorder characterized by persistent sadness and loss of interest.",
            ),
            DiseaseInfo(
                name="Anxiety Disorder",
                category="mental_health",
                description="Mental health condition featuring excessive worry and fear.",
            ),
            DiseaseInfo(
                name="Asthma",
                category="respiratory",
                description="Chronic respiratory condition causing difficulty breathing due to airway inflammation.",
            ),
            DiseaseInfo(
                name="Alzheimer's Disease",
                category="neurological",
                description="Progressive brain disorder affecting memory, thinking, and behavior.",
            ),
            DiseaseInfo(
                name="Stroke",
                category="neurological",
                description="Medical emergency when blood flow to the brain is interrupted.",
            ),
            DiseaseInfo(
                name="Arthritis",
                category="musculoskeletal",
                description="Joint inflammation causing pain, swelling, and reduced range of motion.",
            ),
            DiseaseInfo(
                name="Kidney Disease",
                category="urological",
                description="Chronic condition affecting kidney function and filtration.",
            ),
            DiseaseInfo(
                name="Psoriasis",
                category="dermatological",
                description="Autoimmune skin condition causing scaly, inflamed patches.",
            ),
        ]
        diseases.extend(fallback_diseases)

    # Sort diseases alphabetically by name
    diseases.sort(key=lambda d: d.name.lower())

    # Remove any remaining duplicates based on name (case-insensitive)
    unique_diseases = []
    seen_names_lower = set()
    for disease in diseases:
        name_lower = disease.name.lower()
        if name_lower not in seen_names_lower:
            seen_names_lower.add(name_lower)
            unique_diseases.append(disease)

    return unique_diseases


def search_diseases(diseases: List[DiseaseInfo], query: str) -> List[DiseaseInfo]:
    """Search diseases by name, category, or description"""
    if not query:
        return diseases

    query_lower = query.lower()
    filtered_diseases = []

    for disease in diseases:
        # Search in name, category, and description
        if (
            query_lower in disease.name.lower()
            or query_lower in disease.category.lower()
            or query_lower in disease.description.lower()
        ):
            filtered_diseases.append(disease)

    # Sort by relevance (name matches first, then category, then description)
    filtered_diseases.sort(
        key=lambda d: (
            query_lower not in d.name.lower(),
            query_lower not in d.category.lower(),
            query_lower not in d.description.lower(),
        )
    )

    return filtered_diseases


# Global diseases cache
diseases_cache = []


# API Endpoints
@app.get("/", response_model=HealthCheck)
async def root():
    try:
        collections = chroma_client.list_collections()
        collection_names = [c.name for c in collections]

        return HealthCheck(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            version="2.0.0",
            ai_provider=llm_provider.__class__.__name__,
            chroma_collections=collection_names,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.get("/diseases", response_model=DiseasesResponse)
async def get_diseases(query: Optional[str] = None, limit: Optional[int] = 100):
    """
    Get all diseases or search diseases by name, category, or description.

    Parameters:
    - query: Optional search query to filter diseases
    - limit: Maximum number of diseases to return (default: 100)
    """
    start_time = time.time()

    try:
        global diseases_cache

        # Load diseases from cache or extract from ChromaDB
        if not diseases_cache:
            diseases_cache = extract_diseases_from_chroma(chroma_client)

        # Search or filter diseases
        if query:
            filtered_diseases = search_diseases(diseases_cache, query)
        else:
            filtered_diseases = diseases_cache

        # Apply limit
        if limit:
            filtered_diseases = filtered_diseases[:limit]

        search_time_ms = int((time.time() - start_time) * 1000)

        return DiseasesResponse(
            total_diseases=len(filtered_diseases),
            diseases=filtered_diseases,
            query=query,
            search_time_ms=search_time_ms,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving diseases: {str(e)}"
        )


@app.get("/diseases/categories")
async def get_disease_categories():
    """Get all available disease categories"""
    try:
        global diseases_cache

        if not diseases_cache:
            diseases_cache = extract_diseases_from_chroma(chroma_client)

        categories = {}
        for disease in diseases_cache:
            category = disease.category
            if category not in categories:
                categories[category] = {
                    "name": category,
                    "count": 0,
                    "display_name": category.replace("_", " ").title(),
                }
            categories[category]["count"] += 1

        return {
            "total_categories": len(categories),
            "categories": list(categories.values()),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving disease categories: {str(e)}"
        )


@app.post("/medical/query", response_model=MedicalResponse)
async def process_medical_query(query_data: MedicalQuery):
    start_time = time.time()

    try:
        # Get conversation history
        history = chat_session.get_history()

        # Contextualize query (always, like CLI does)
        original_query = query_data.query
        contextualized_query = original_query
        
        try:
            contextualized_query = llm_provider.contextualize_query(
                original_query, history
            )
            if contextualized_query != original_query:
                print(f"[Context] Rewrote query: '{original_query}' -> '{contextualized_query}'")
        except Exception as e:
            print(f"[Context] Failed to contextualize query: {e}")
            contextualized_query = original_query

        # Process query with anti_test.py orchestration
        result = orchestrate(
            query_text=contextualized_query,
            client=chroma_client,
            embedder=embedder,
            llm=llm_provider,
            collections_filter=None,
            max_workers=4,
        )
        print(f"Orchestration result: {result}")
        
        # Generate clean answer like CLI does
        try:
            # Use LLM to generate clean conversational reply without citations
            clean_answer = llm_provider.generate_chat_reply(
                original_query, 
                result.get("answer", ""), 
                result.get("links", [])
            )
        except Exception as e:
            print(f"[Warning] Failed to generate chat reply: {e}")
            # Fallback: use raw answer but remove citation markers
            clean_answer = result.get("answer", "")
            # Remove citation markers like [A1], [A2], etc.
            import re
            clean_answer = re.sub(r'\[A\d+\]', '', clean_answer)
            clean_answer = re.sub(r'\s+', ' ', clean_answer).strip()
        
        # Extract data from orchestrate result
        answer = clean_answer
        links = result.get("links", [])  # List[str] of URLs

        # Convert links (URLs) to MedicalLink format
        medical_links = []
        for url in links:
            # Extract a simple title from URL
            if isinstance(url, str):
                # Try to extract a meaningful title from the URL
                title = url.split("/")[-1].replace("-", " ").replace("_", " ").title()
                if not title or title == "":
                    title = "Medical Resource"

                # Determine source type from URL patterns
                source_type = "general"
                if any(
                    term in url.lower() for term in ["medicine", "drug", "patient.info"]
                ):
                    source_type = "medicine"
                elif any(term in url.lower() for term in ["symptom", "signs"]):
                    source_type = "symptoms"
                elif any(
                    term in url.lower() for term in ["disease", "condition", "disorder"]
                ):
                    source_type = "diseases"

                medical_links.append(
                    MedicalLink(
                        title=title,
                        url=url,
                        source_type=source_type,
                        relevance_score=0.8,  # Default score since we don't have individual scores
                    )
                )

        # Calculate metrics
        total_docs = sum(
            entry.get("docs_used", 0) for entry in result.get("per_agent", [])
        )
        avg_confidence = (
            sum(entry.get("confidence", 0) for entry in result.get("per_agent", []))
            / len(result.get("per_agent", []))
            if result.get("per_agent")
            else 0.0
        )

        response_time_ms = int((time.time() - start_time) * 1000)
        query_intent = detect_query_intent(query_data.query)

        # Save conversation turn to chat_history.json
        try:
            chat_session.add_turn(original_query, answer, links)
        except Exception as e:
            print(f"Warning: Failed to save chat history: {e}")

        return MedicalResponse(
            query=query_data.query,
            answer=answer,
            links=medical_links,
            query_intent=query_intent,
            confidence_score=round(avg_confidence, 3),
            response_time_ms=response_time_ms,
            sources_count=total_docs,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing medical query: {str(e)}"
        )


@app.on_event("startup")
async def startup_event():
    print("🩺 TrustMed-AI API Starting...")
    print(f"🤖 AI Provider: {llm_provider.__class__.__name__}")
    print(f"📊 ChromaDB Path: {CHROMA_DB_DIR}")
    print(f"💬 Chat History: {CHAT_HISTORY_FILE}")

    try:
        collections = chroma_client.list_collections()
        print(f"📚 Available Collections: {[c.name for c in collections]}")

        total_docs = 0
        for collection in collections:
            try:
                count = collection.count()
                total_docs += count
                print(f"   • {collection.name}: {count} documents")
            except Exception as e:
                print(f"   • {collection.name}: Error - {e}")

        print(f"📄 Total Documents: {total_docs}")

        # Pre-load diseases cache
        global diseases_cache
        print("🔄 Loading diseases cache...")
        diseases_cache = extract_diseases_from_chroma(chroma_client)
        print(f"✅ Loaded {len(diseases_cache)} diseases into cache")

    except Exception as e:
        print(f"❌ ChromaDB Error: {e}")
        raise

    print("✅ TrustMed-AI API Ready!")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Diseases Endpoint: http://localhost:8000/diseases")
    print("📊 Categories Endpoint: http://localhost:8000/diseases/categories")


if __name__ == "__main__":
    uvicorn.run(
        "trustmed_api:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
    )
