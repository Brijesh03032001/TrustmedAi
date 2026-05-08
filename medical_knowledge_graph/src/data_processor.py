"""
Medical Data Extraction and Processing

This module handles extraction of medical data from SQLite and preparation for Neo4j import.
"""

import sqlite3
import json
import re
from typing import Dict, List, Any, Set, Tuple
import logging
from dataclasses import dataclass
from pathlib import Path

# For text processing and embeddings
try:
    import pandas as pd

    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Warning: pandas not available. Install with: pip install pandas")

try:
    import spacy
    from spacy.lang.en import English

    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    print("Warning: spaCy not available. Install with: pip install spacy")

try:
    from sentence_transformers import SentenceTransformer

    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print(
        "Warning: sentence-transformers not available. Install with: pip install sentence-transformers"
    )

from config.settings import settings, MEDICAL_PATTERNS


@dataclass
class MedicalEntity:
    """Represents a medical entity extracted from text."""

    id: str
    name: str
    type: str  # disease, symptom, cause, risk_factor, etc.
    description: str
    metadata: Dict[str, Any]
    embedding: List[float] = None


@dataclass
class MedicalRelationship:
    """Represents a relationship between medical entities."""

    source_id: str
    target_id: str
    relationship_type: str
    properties: Dict[str, Any]


class TextProcessor:
    """Handles text processing and NLP tasks."""

    def __init__(self):
        self.nlp = None
        self.embedding_model = None

        # Initialize spaCy
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
                logging.info("✅ spaCy model loaded successfully")
            except OSError:
                try:
                    # Fallback to basic English model
                    self.nlp = English()
                    logging.warning(
                        "⚠️  Using basic English model. Install full model with: python -m spacy download en_core_web_sm"
                    )
                except Exception as e:
                    logging.error(f"❌ Failed to load spaCy model: {e}")

        # Initialize sentence transformer
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.embedding_model = SentenceTransformer(settings.nlp.spacy_model)
                logging.info("✅ Sentence transformer model loaded successfully")
            except Exception as e:
                logging.error(f"❌ Failed to load sentence transformer: {e}")

    def clean_text(self, text: str) -> str:
        """Clean and normalize medical text."""
        if not text:
            return ""

        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text.strip())

        # Remove special characters but keep medical abbreviations
        text = re.sub(r"[^\w\s\-\.\(\)]", " ", text)

        # Normalize case for consistency
        if settings.nlp.lowercase:
            text = text.lower()

        return text

    def extract_medical_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract medical entities from text using pattern matching."""
        entities = {"symptoms": [], "body_parts": [], "severity": []}

        text_lower = text.lower()

        # Extract entities using predefined patterns
        for entity_type, patterns in MEDICAL_PATTERNS.items():
            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                entities[entity_type].extend(matches)

        # Remove duplicates
        for entity_type in entities:
            entities[entity_type] = list(set(entities[entity_type]))

        return entities

    def get_embedding(self, text: str) -> List[float]:
        """Generate semantic embedding for text."""
        if not self.embedding_model or not text:
            return []

        try:
            embedding = self.embedding_model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logging.error(f"❌ Failed to generate embedding: {e}")
            return []

    def calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts."""
        if not self.embedding_model or not text1 or not text2:
            return 0.0

        try:
            embeddings = self.embedding_model.encode([text1, text2])

            # Calculate cosine similarity
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np

            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(similarity)
        except Exception as e:
            logging.error(f"❌ Failed to calculate similarity: {e}")
            return 0.0


class MedicalDataExtractor:
    """Extracts and processes medical data from SQLite database."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self.text_processor = TextProcessor()
        self.entities: List[MedicalEntity] = []
        self.relationships: List[MedicalRelationship] = []

    def connect_to_database(self):
        """Create connection to SQLite database."""
        if not Path(self.db_path).exists():
            raise FileNotFoundError(f"Database not found: {self.db_path}")

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def extract_diseases(self) -> List[MedicalEntity]:
        """Extract disease entities from database."""
        diseases = []

        try:
            with self.connect_to_database() as conn:
                cursor = conn.cursor()

                # Get all diseases with their information
                cursor.execute("""
                    SELECT 
                        id,
                        disease_name as name,
                        symptoms,
                        causes,
                        risk_factors,
                        complications,
                        source_url as source
                    FROM symptom
                """)

                for row in cursor.fetchall():
                    # Clean and process text fields
                    description_parts = []
                    if row["symptoms"]:
                        description_parts.append(f"Symptoms: {row['symptoms']}")
                    if row["causes"]:
                        description_parts.append(f"Causes: {row['causes']}")

                    full_description = ". ".join(description_parts)
                    cleaned_description = self.text_processor.clean_text(
                        full_description
                    )

                    # Generate embedding
                    embedding = self.text_processor.get_embedding(cleaned_description)

                    # Extract medical entities from text
                    extracted_entities = self.text_processor.extract_medical_entities(
                        cleaned_description
                    )

                    disease = MedicalEntity(
                        id=f"disease_{row['id']}",
                        name=row["name"],
                        type="disease",
                        description=cleaned_description,
                        metadata={
                            "original_id": row["id"],
                            "symptoms": row["symptoms"],
                            "causes": row["causes"],
                            "risk_factors": row["risk_factors"],
                            "complications": row["complications"],
                            "source": row["source"],
                            "extracted_entities": extracted_entities,
                        },
                        embedding=embedding,
                    )

                    diseases.append(disease)
                    logging.info(f"✅ Extracted disease: {disease.name}")

                logging.info(f"🎉 Successfully extracted {len(diseases)} diseases")

        except Exception as e:
            logging.error(f"❌ Failed to extract diseases: {e}")

        return diseases

    def extract_symptoms(self, diseases: List[MedicalEntity]) -> List[MedicalEntity]:
        """Extract unique symptom entities from disease data."""
        symptoms_set = set()
        symptoms = []

        for disease in diseases:
            # Extract symptoms from the symptoms field
            symptoms_text = disease.metadata.get("symptoms", "")
            if symptoms_text:
                # Split symptoms by common separators
                symptom_list = re.split(r"[,;]|\band\b|\bor\b", symptoms_text)

                for symptom in symptom_list:
                    symptom = symptom.strip()
                    if symptom and len(symptom) > 3:  # Filter out very short symptoms
                        symptom_clean = self.text_processor.clean_text(symptom)

                        if symptom_clean not in symptoms_set:
                            symptoms_set.add(symptom_clean)

                            # Generate embedding for symptom
                            embedding = self.text_processor.get_embedding(symptom_clean)

                            symptom_entity = MedicalEntity(
                                id=f"symptom_{len(symptoms) + 1}",
                                name=symptom_clean,
                                type="symptom",
                                description=f"Medical symptom: {symptom_clean}",
                                metadata={
                                    "related_diseases": [disease.id],
                                    "frequency": 1,
                                },
                                embedding=embedding,
                            )

                            symptoms.append(symptom_entity)

        logging.info(f"🎉 Successfully extracted {len(symptoms)} unique symptoms")
        return symptoms

    def create_relationships(
        self, diseases: List[MedicalEntity], symptoms: List[MedicalEntity]
    ) -> List[MedicalRelationship]:
        """Create relationships between diseases and symptoms."""
        relationships = []

        # Create symptom name to entity mapping for fast lookup
        symptom_map = {symptom.name.lower(): symptom for symptom in symptoms}

        for disease in diseases:
            symptoms_text = disease.metadata.get("symptoms", "")
            if symptoms_text:
                # Extract symptom mentions from disease description
                symptom_list = re.split(r"[,;]|\band\b|\bor\b", symptoms_text)

                for symptom_mention in symptom_list:
                    symptom_mention = symptom_mention.strip().lower()
                    symptom_clean = self.text_processor.clean_text(symptom_mention)

                    # Find matching symptom entity
                    matching_symptom = None
                    for symptom_name, symptom_entity in symptom_map.items():
                        if (
                            symptom_clean in symptom_name
                            or symptom_name in symptom_clean
                        ):
                            matching_symptom = symptom_entity
                            break

                    if matching_symptom:
                        relationship = MedicalRelationship(
                            source_id=disease.id,
                            target_id=matching_symptom.id,
                            relationship_type="HAS_SYMPTOM",
                            properties={"strength": 1.0, "source": "medical_database"},
                        )
                        relationships.append(relationship)

        logging.info(f"🎉 Created {len(relationships)} disease-symptom relationships")
        return relationships

    def calculate_disease_similarities(
        self, diseases: List[MedicalEntity]
    ) -> List[MedicalRelationship]:
        """Calculate similarity relationships between diseases."""
        similarities = []

        if not self.text_processor.embedding_model:
            logging.warning("⚠️  Cannot calculate similarities without embedding model")
            return similarities

        for i, disease1 in enumerate(diseases):
            for j, disease2 in enumerate(diseases[i + 1 :], i + 1):
                # Calculate similarity based on descriptions
                similarity = self.text_processor.calculate_text_similarity(
                    disease1.description, disease2.description
                )

                # Only create relationship if similarity is above threshold
                if similarity > settings.data.similarity_threshold:
                    relationship = MedicalRelationship(
                        source_id=disease1.id,
                        target_id=disease2.id,
                        relationship_type="SIMILAR_TO",
                        properties={
                            "similarity_score": similarity,
                            "similarity_type": "semantic",
                            "method": "sentence_transformer",
                        },
                    )
                    similarities.append(relationship)

        logging.info(f"🎉 Found {len(similarities)} similar disease pairs")
        return similarities

    def process_all_data(self) -> Tuple[List[MedicalEntity], List[MedicalRelationship]]:
        """Process all medical data and return entities and relationships."""
        logging.info("🚀 Starting comprehensive data extraction...")

        # Extract diseases
        diseases = self.extract_diseases()

        # Extract symptoms
        symptoms = self.extract_symptoms(diseases)

        # Combine all entities
        all_entities = diseases + symptoms

        # Create relationships
        disease_symptom_rels = self.create_relationships(diseases, symptoms)
        similarity_rels = self.calculate_disease_similarities(diseases)

        all_relationships = disease_symptom_rels + similarity_rels

        logging.info(f"✅ Data processing completed:")
        logging.info(f"   • Entities: {len(all_entities)}")
        logging.info(f"   • Relationships: {len(all_relationships)}")

        return all_entities, all_relationships

    def export_to_json(
        self,
        entities: List[MedicalEntity],
        relationships: List[MedicalRelationship],
        output_dir: str = "data/processed",
    ):
        """Export processed data to JSON files for inspection."""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        # Export entities
        entities_data = []
        for entity in entities:
            entities_data.append(
                {
                    "id": entity.id,
                    "name": entity.name,
                    "type": entity.type,
                    "description": entity.description,
                    "metadata": entity.metadata,
                    "has_embedding": len(entity.embedding) > 0
                    if entity.embedding
                    else False,
                }
            )

        with open(output_path / "entities.json", "w") as f:
            json.dump(entities_data, f, indent=2)

        # Export relationships
        relationships_data = []
        for rel in relationships:
            relationships_data.append(
                {
                    "source_id": rel.source_id,
                    "target_id": rel.target_id,
                    "relationship_type": rel.relationship_type,
                    "properties": rel.properties,
                }
            )

        with open(output_path / "relationships.json", "w") as f:
            json.dump(relationships_data, f, indent=2)

        logging.info(f"📁 Data exported to {output_path}")


def main():
    """Main function to run data extraction."""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )

    # Initialize extractor
    db_path = settings.data_dir / "medical_symptoms.db"
    extractor = MedicalDataExtractor(str(db_path))

    try:
        # Process all data
        entities, relationships = extractor.process_all_data()

        # Export for inspection
        extractor.export_to_json(entities, relationships)

        print(f"\n✅ Data extraction completed successfully!")
        print(f"📊 Summary:")
        print(f"   • Total entities: {len(entities)}")
        print(f"   • Total relationships: {len(relationships)}")

        # Show entity breakdown
        entity_counts = {}
        for entity in entities:
            entity_counts[entity.type] = entity_counts.get(entity.type, 0) + 1

        print(f"\n🏷️  Entity breakdown:")
        for entity_type, count in entity_counts.items():
            print(f"   • {entity_type.title()}: {count}")

        # Show relationship breakdown
        rel_counts = {}
        for rel in relationships:
            rel_counts[rel.relationship_type] = (
                rel_counts.get(rel.relationship_type, 0) + 1
            )

        print(f"\n🔗 Relationship breakdown:")
        for rel_type, count in rel_counts.items():
            print(f"   • {rel_type}: {count}")

    except Exception as e:
        logging.error(f"❌ Data extraction failed: {e}")
        raise


if __name__ == "__main__":
    main()
