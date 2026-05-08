"""
Medical Knowledge Graph Configuration

This module contains all configuration settings for the medical knowledge graph system.
"""

import os
from pathlib import Path
from typing import Dict, Any

# Try to use the correct pydantic settings
try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
except ImportError:
    try:
        from pydantic import BaseSettings, Field
    except ImportError:
        # Fallback for systems without pydantic
        class BaseSettings:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)

        def Field(default=None, env=None):
            return default


class Neo4jConfig(BaseSettings):
    """Neo4j database configuration."""

    uri: str = Field(default="bolt://localhost:7687", env="NEO4J_URI")
    username: str = Field(default="neo4j", env="NEO4J_USERNAME")
    password: str = Field(default="password", env="NEO4J_PASSWORD")
    database: str = Field(default="neo4j", env="NEO4J_DATABASE")

    # Connection settings
    max_connection_lifetime: int = 3600
    max_connection_pool_size: int = 50
    connection_acquisition_timeout: int = 60


class DataConfig(BaseSettings):
    """Data processing configuration."""

    # Source database
    sqlite_db_path: str = "data/medical_symptoms.db"

    # Batch processing
    batch_size: int = 1000
    max_workers: int = 4

    # Text processing
    min_text_length: int = 10
    max_text_length: int = 5000

    # Embedding settings
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    similarity_threshold: float = 0.75


class GraphConfig(BaseSettings):
    """Graph structure configuration."""

    # Node types and their properties
    node_types: Dict[str, Any] = {
        "Disease": {
            "primary_key": "disease_id",
            "required_fields": ["name", "description"],
            "optional_fields": ["severity", "prevalence", "source"],
        },
        "Symptom": {
            "primary_key": "symptom_id",
            "required_fields": ["name", "description"],
            "optional_fields": ["severity", "frequency", "body_system"],
        },
        "Cause": {
            "primary_key": "cause_id",
            "required_fields": ["name", "type"],
            "optional_fields": ["mechanism", "category"],
        },
        "RiskFactor": {
            "primary_key": "risk_factor_id",
            "required_fields": ["name", "type"],
            "optional_fields": ["impact_level", "modifiable"],
        },
        "Treatment": {
            "primary_key": "treatment_id",
            "required_fields": ["name", "type"],
            "optional_fields": ["effectiveness", "side_effects"],
        },
        "BodySystem": {
            "primary_key": "system_id",
            "required_fields": ["name"],
            "optional_fields": ["parent_system", "organs"],
        },
    }

    # Relationship types
    relationship_types: Dict[str, Any] = {
        "HAS_SYMPTOM": {"weight_field": "frequency", "direction": "outgoing"},
        "CAUSED_BY": {"weight_field": "causality_strength", "direction": "outgoing"},
        "HAS_RISK_FACTOR": {"weight_field": "risk_level", "direction": "outgoing"},
        "TREATED_BY": {"weight_field": "effectiveness", "direction": "outgoing"},
        "AFFECTS_SYSTEM": {"weight_field": "impact", "direction": "outgoing"},
        "SIMILAR_TO": {"weight_field": "similarity_score", "direction": "undirected"},
        "COMPLICATES": {"weight_field": "complication_risk", "direction": "outgoing"},
        "PREVENTS": {"weight_field": "prevention_efficacy", "direction": "outgoing"},
    }


class NLPConfig(BaseSettings):
    """NLP processing configuration."""

    # spaCy models
    spacy_model: str = "en_core_web_sm"
    spacy_model_large: str = "en_core_web_lg"

    # Medical entity extraction
    medical_entities: list = [
        "DISEASE",
        "SYMPTOM",
        "MEDICATION",
        "DOSAGE",
        "BODY_PART",
        "PROCEDURE",
        "TEST",
    ]

    # Text preprocessing
    remove_stopwords: bool = True
    lemmatize: bool = True
    lowercase: bool = True
    remove_punctuation: bool = True

    # Similarity settings
    similarity_methods: list = ["cosine", "semantic", "jaccard"]
    min_similarity_score: float = 0.6


class LoggingConfig(BaseSettings):
    """Logging configuration."""

    log_level: str = "INFO"
    log_format: str = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    log_file: str = "logs/medical_kg.log"
    max_log_size: str = "10 MB"
    retention: str = "7 days"


class Settings(BaseSettings):
    """Main settings class combining all configurations."""

    # Environment
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")

    # Project paths
    project_root: Path = Path(__file__).parent.parent
    data_dir: Path = project_root / "data"
    logs_dir: Path = project_root / "logs"
    models_dir: Path = project_root / "models"

    # Component configurations
    neo4j: Neo4jConfig = Neo4jConfig()
    data: DataConfig = DataConfig()
    graph: GraphConfig = GraphConfig()
    nlp: NLPConfig = NLPConfig()
    logging: LoggingConfig = LoggingConfig()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.logs_dir.mkdir(exist_ok=True)
        self.models_dir.mkdir(exist_ok=True)


# Global settings instance
settings = Settings()


# Neo4j Cypher queries templates
CYPHER_QUERIES = {
    "create_constraints": {
        "disease_id": "CREATE CONSTRAINT disease_id IF NOT EXISTS FOR (d:Disease) REQUIRE d.disease_id IS UNIQUE",
        "symptom_id": "CREATE CONSTRAINT symptom_id IF NOT EXISTS FOR (s:Symptom) REQUIRE s.symptom_id IS UNIQUE",
        "cause_id": "CREATE CONSTRAINT cause_id IF NOT EXISTS FOR (c:Cause) REQUIRE c.cause_id IS UNIQUE",
        "risk_factor_id": "CREATE CONSTRAINT risk_factor_id IF NOT EXISTS FOR (r:RiskFactor) REQUIRE r.risk_factor_id IS UNIQUE",
    },
    "create_indexes": {
        "disease_name": "CREATE INDEX disease_name IF NOT EXISTS FOR (d:Disease) ON (d.name)",
        "symptom_name": "CREATE INDEX symptom_name IF NOT EXISTS FOR (s:Symptom) ON (s.name)",
        "disease_embedding": "CREATE INDEX disease_embedding IF NOT EXISTS FOR (d:Disease) ON (d.embedding)",
        "symptom_embedding": "CREATE INDEX symptom_embedding IF NOT EXISTS FOR (s:Symptom) ON (s.embedding)",
    },
    "node_creation": {
        "disease": """
            MERGE (d:Disease {disease_id: $disease_id})
            SET d.name = $name,
                d.description = $description,
                d.symptoms = $symptoms,
                d.causes = $causes,
                d.risk_factors = $risk_factors,
                d.complications = $complications,
                d.embedding = $embedding,
                d.created_at = datetime(),
                d.updated_at = datetime()
            RETURN d
        """,
        "symptom": """
            MERGE (s:Symptom {name: $name})
            SET s.description = $description,
                s.body_system = $body_system,
                s.severity = $severity,
                s.embedding = $embedding,
                s.created_at = datetime(),
                s.updated_at = datetime()
            RETURN s
        """,
    },
    "relationship_creation": {
        "has_symptom": """
            MATCH (d:Disease {disease_id: $disease_id})
            MATCH (s:Symptom {name: $symptom_name})
            MERGE (d)-[r:HAS_SYMPTOM]->(s)
            SET r.frequency = $frequency,
                r.severity = $severity,
                r.created_at = datetime()
            RETURN r
        """,
        "similarity": """
            MATCH (d1:Disease {disease_id: $disease_id_1})
            MATCH (d2:Disease {disease_id: $disease_id_2})
            MERGE (d1)-[r:SIMILAR_TO]-(d2)
            SET r.similarity_score = $similarity_score,
                r.similarity_type = $similarity_type,
                r.created_at = datetime()
            RETURN r
        """,
    },
    "analysis_queries": {
        "most_common_symptoms": """
            MATCH (s:Symptom)<-[r:HAS_SYMPTOM]-(d:Disease)
            RETURN s.name as symptom, count(d) as disease_count
            ORDER BY disease_count DESC
            LIMIT $limit
        """,
        "disease_similarity": """
            MATCH (d1:Disease {disease_id: $disease_id})-[r:SIMILAR_TO]-(d2:Disease)
            RETURN d2.name as similar_disease, 
                   d2.disease_id as disease_id,
                   r.similarity_score as score
            ORDER BY r.similarity_score DESC
            LIMIT $limit
        """,
        "symptom_co_occurrence": """
            MATCH (d:Disease)-[:HAS_SYMPTOM]->(s1:Symptom)
            MATCH (d)-[:HAS_SYMPTOM]->(s2:Symptom)
            WHERE s1.name < s2.name
            RETURN s1.name as symptom1, 
                   s2.name as symptom2, 
                   count(d) as co_occurrence_count
            ORDER BY co_occurrence_count DESC
            LIMIT $limit
        """,
    },
}


# Medical entity patterns for NLP extraction
MEDICAL_PATTERNS = {
    "symptoms": [
        r"\b(?:pain|ache|aching|hurt|hurting|sore|soreness)\b",
        r"\b(?:fever|temperature|hot|chills|sweating)\b",
        r"\b(?:nausea|vomiting|sick|queasy)\b",
        r"\b(?:headache|migraine|head pain)\b",
        r"\b(?:fatigue|tired|exhausted|weakness|weak)\b",
        r"\b(?:cough|coughing|wheeze|wheezing)\b",
        r"\b(?:shortness of breath|breathless|dyspnea)\b",
        r"\b(?:dizziness|dizzy|lightheaded|vertigo)\b",
    ],
    "body_parts": [
        r"\b(?:head|brain|skull|face|eye|ear|nose|mouth|throat|neck)\b",
        r"\b(?:chest|heart|lung|breast|shoulder|arm|hand|finger)\b",
        r"\b(?:abdomen|stomach|liver|kidney|back|spine|hip|leg|foot|toe)\b",
        r"\b(?:skin|muscle|bone|joint|nerve|blood|vessel)\b",
    ],
    "severity": [
        r"\b(?:mild|moderate|severe|acute|chronic|persistent|intermittent)\b",
        r"\b(?:sharp|dull|burning|stabbing|throbbing|cramping)\b",
    ],
}
