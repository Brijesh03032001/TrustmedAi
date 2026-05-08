"""
Knowledge Graph Query Engine

This module provides advanced querying capabilities for the medical knowledge graph,
including similarity searches, pattern matching, and analytics.
"""

import logging
from typing import List, Dict, Any, Optional, Union
import json
from dataclasses import dataclass

try:
    from neo4j import GraphDatabase

    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    logging.warning("Neo4j driver not available. Install with: pip install neo4j")

from config.settings import settings


@dataclass
class QueryResult:
    """Represents the result of a knowledge graph query."""

    query_type: str
    results: List[Dict[str, Any]]
    total_count: int
    execution_time: float
    metadata: Dict[str, Any] = None


class KnowledgeGraphQuery:
    """Advanced query engine for the medical knowledge graph."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def find_diseases_by_symptoms(
        self, symptoms: List[str], limit: int = 10
    ) -> QueryResult:
        """Find diseases that match given symptoms."""
        if not self.driver:
            raise ConnectionError("Neo4j driver not available")

        import time

        start_time = time.time()

        # Build dynamic query based on number of symptoms
        symptom_conditions = []
        parameters = {"limit": limit}

        for i, symptom in enumerate(symptoms):
            symptom_conditions.append(f"(d)-[:HAS_SYMPTOM]->(s{i}:Symptom)")
            symptom_conditions.append(
                f"toLower(s{i}.name) CONTAINS toLower($symptom_{i})"
            )
            parameters[f"symptom_{i}"] = symptom

        query = f"""
        MATCH {", ".join(symptom_conditions[: len(symptoms)])}
        WHERE {" AND ".join(symptom_conditions[len(symptoms) :])}
        RETURN DISTINCT d.id as disease_id,
               d.name as disease_name,
               d.description as description,
               count(DISTINCT s0) as matching_symptoms
        ORDER BY matching_symptoms DESC, d.name
        LIMIT $limit
        """

        try:
            with self.driver.session() as session:
                result = session.run(query, parameters)

                results = []
                for record in result:
                    results.append(
                        {
                            "disease_id": record["disease_id"],
                            "disease_name": record["disease_name"],
                            "description": record["description"],
                            "matching_symptoms": record["matching_symptoms"],
                            "relevance_score": record["matching_symptoms"]
                            / len(symptoms),
                        }
                    )

                execution_time = time.time() - start_time

                return QueryResult(
                    query_type="diseases_by_symptoms",
                    results=results,
                    total_count=len(results),
                    execution_time=execution_time,
                    metadata={"searched_symptoms": symptoms},
                )

        except Exception as e:
            logging.error(f"❌ Query failed: {e}")
            raise

    def find_similar_diseases(
        self, disease_id: str, limit: int = 10, min_similarity: float = 0.7
    ) -> QueryResult:
        """Find diseases similar to a given disease."""
        import time

        start_time = time.time()

        query = """
        MATCH (d1:Disease {id: $disease_id})-[r:SIMILAR_TO]-(d2:Disease)
        WHERE r.similarity_score >= $min_similarity
        RETURN d2.id as similar_disease_id,
               d2.name as similar_disease_name,
               d2.description as description,
               r.similarity_score as similarity_score,
               r.similarity_type as similarity_type
        ORDER BY r.similarity_score DESC
        LIMIT $limit
        """

        try:
            with self.driver.session() as session:
                result = session.run(
                    query,
                    {
                        "disease_id": disease_id,
                        "min_similarity": min_similarity,
                        "limit": limit,
                    },
                )

                results = []
                for record in result:
                    results.append(
                        {
                            "disease_id": record["similar_disease_id"],
                            "disease_name": record["similar_disease_name"],
                            "description": record["description"],
                            "similarity_score": record["similarity_score"],
                            "similarity_type": record["similarity_type"],
                        }
                    )

                execution_time = time.time() - start_time

                return QueryResult(
                    query_type="similar_diseases",
                    results=results,
                    total_count=len(results),
                    execution_time=execution_time,
                    metadata={
                        "source_disease_id": disease_id,
                        "min_similarity": min_similarity,
                    },
                )

        except Exception as e:
            logging.error(f"❌ Similar diseases query failed: {e}")
            raise

    def find_symptom_patterns(self, limit: int = 20) -> QueryResult:
        """Find common symptom co-occurrence patterns."""
        import time

        start_time = time.time()

        query = """
        MATCH (d:Disease)-[:HAS_SYMPTOM]->(s1:Symptom)
        MATCH (d)-[:HAS_SYMPTOM]->(s2:Symptom)
        WHERE s1.name < s2.name
        WITH s1, s2, count(d) as co_occurrence_count
        WHERE co_occurrence_count >= 3
        RETURN s1.name as symptom1,
               s2.name as symptom2,
               co_occurrence_count,
               co_occurrence_count * 1.0 / 
               (CASE 
                WHEN co_occurrence_count > 0 
                THEN co_occurrence_count 
                ELSE 1 
               END) as pattern_strength
        ORDER BY co_occurrence_count DESC
        LIMIT $limit
        """

        try:
            with self.driver.session() as session:
                result = session.run(query, {"limit": limit})

                results = []
                for record in result:
                    results.append(
                        {
                            "symptom1": record["symptom1"],
                            "symptom2": record["symptom2"],
                            "co_occurrence_count": record["co_occurrence_count"],
                            "pattern_strength": record["pattern_strength"],
                        }
                    )

                execution_time = time.time() - start_time

                return QueryResult(
                    query_type="symptom_patterns",
                    results=results,
                    total_count=len(results),
                    execution_time=execution_time,
                    metadata={"min_co_occurrence": 3},
                )

        except Exception as e:
            logging.error(f"❌ Symptom patterns query failed: {e}")
            raise

    def get_disease_profile(self, disease_id: str) -> QueryResult:
        """Get comprehensive profile of a specific disease."""
        import time

        start_time = time.time()

        query = """
        MATCH (d:Disease {id: $disease_id})
        OPTIONAL MATCH (d)-[:HAS_SYMPTOM]->(s:Symptom)
        OPTIONAL MATCH (d)-[:SIMILAR_TO]-(similar:Disease)
        RETURN d.id as disease_id,
               d.name as disease_name,
               d.description as description,
               d.type as type,
               collect(DISTINCT s.name) as symptoms,
               collect(DISTINCT similar.name) as similar_diseases,
               count(DISTINCT s) as symptom_count,
               count(DISTINCT similar) as similar_count
        """

        try:
            with self.driver.session() as session:
                result = session.run(query, {"disease_id": disease_id})
                record = result.single()

                if not record:
                    results = []
                else:
                    results = [
                        {
                            "disease_id": record["disease_id"],
                            "disease_name": record["disease_name"],
                            "description": record["description"],
                            "type": record["type"],
                            "symptoms": record["symptoms"],
                            "similar_diseases": record["similar_diseases"],
                            "symptom_count": record["symptom_count"],
                            "similar_count": record["similar_count"],
                        }
                    ]

                execution_time = time.time() - start_time

                return QueryResult(
                    query_type="disease_profile",
                    results=results,
                    total_count=len(results),
                    execution_time=execution_time,
                    metadata={"disease_id": disease_id},
                )

        except Exception as e:
            logging.error(f"❌ Disease profile query failed: {e}")
            raise

    def search_by_text(
        self, search_text: str, entity_types: List[str] = None, limit: int = 10
    ) -> QueryResult:
        """Perform full-text search across the knowledge graph."""
        import time

        start_time = time.time()

        # Default to searching all entity types
        if entity_types is None:
            entity_types = ["Disease", "Symptom"]

        # Build query for multiple entity types
        union_queries = []
        for entity_type in entity_types:
            union_queries.append(f"""
            MATCH (n:{entity_type})
            WHERE toLower(n.name) CONTAINS toLower($search_text)
               OR toLower(n.description) CONTAINS toLower($search_text)
            RETURN n.id as entity_id,
                   n.name as entity_name,
                   n.description as description,
                   "{entity_type.lower()}" as entity_type,
                   CASE 
                     WHEN toLower(n.name) = toLower($search_text) THEN 10
                     WHEN toLower(n.name) CONTAINS toLower($search_text) THEN 5
                     ELSE 1
                   END as relevance_score
            """)

        query = (
            " UNION ".join(union_queries)
            + """
        ORDER BY relevance_score DESC, entity_name
        LIMIT $limit
        """
        )

        try:
            with self.driver.session() as session:
                result = session.run(
                    query, {"search_text": search_text, "limit": limit}
                )

                results = []
                for record in result:
                    results.append(
                        {
                            "entity_id": record["entity_id"],
                            "entity_name": record["entity_name"],
                            "description": record["description"],
                            "entity_type": record["entity_type"],
                            "relevance_score": record["relevance_score"],
                        }
                    )

                execution_time = time.time() - start_time

                return QueryResult(
                    query_type="text_search",
                    results=results,
                    total_count=len(results),
                    execution_time=execution_time,
                    metadata={"search_text": search_text, "entity_types": entity_types},
                )

        except Exception as e:
            logging.error(f"❌ Text search query failed: {e}")
            raise

    def get_graph_statistics(self) -> QueryResult:
        """Get comprehensive statistics about the knowledge graph."""
        import time

        start_time = time.time()

        queries = {
            "node_counts": """
                MATCH (n)
                RETURN labels(n)[0] as node_type, count(n) as count
                ORDER BY count DESC
            """,
            "relationship_counts": """
                MATCH ()-[r]->()
                RETURN type(r) as relationship_type, count(r) as count
                ORDER BY count DESC
            """,
            "most_connected": """
                MATCH (n)
                OPTIONAL MATCH (n)-[r]-()
                RETURN n.id as entity_id, 
                       n.name as entity_name,
                       labels(n)[0] as entity_type,
                       count(r) as connection_count
                ORDER BY connection_count DESC
                LIMIT 10
            """,
            "most_common_symptoms": """
                MATCH (s:Symptom)<-[:HAS_SYMPTOM]-(d:Disease)
                RETURN s.name as symptom, count(d) as disease_count
                ORDER BY disease_count DESC
                LIMIT 10
            """,
        }

        results = {}

        try:
            with self.driver.session() as session:
                for stat_name, query in queries.items():
                    result = session.run(query)
                    results[stat_name] = [dict(record) for record in result]

                execution_time = time.time() - start_time

                return QueryResult(
                    query_type="graph_statistics",
                    results=[results],
                    total_count=1,
                    execution_time=execution_time,
                    metadata={"statistics_types": list(queries.keys())},
                )

        except Exception as e:
            logging.error(f"❌ Graph statistics query failed: {e}")
            raise


class QueryInterface:
    """Interactive query interface for the knowledge graph."""

    def __init__(self, neo4j_driver):
        self.query_engine = KnowledgeGraphQuery(neo4j_driver)

    def execute_query(self, query_type: str, **kwargs) -> QueryResult:
        """Execute a query based on type and parameters."""

        if query_type == "diseases_by_symptoms":
            return self.query_engine.find_diseases_by_symptoms(
                symptoms=kwargs.get("symptoms", []), limit=kwargs.get("limit", 10)
            )

        elif query_type == "similar_diseases":
            return self.query_engine.find_similar_diseases(
                disease_id=kwargs.get("disease_id"),
                limit=kwargs.get("limit", 10),
                min_similarity=kwargs.get("min_similarity", 0.7),
            )

        elif query_type == "symptom_patterns":
            return self.query_engine.find_symptom_patterns(
                limit=kwargs.get("limit", 20)
            )

        elif query_type == "disease_profile":
            return self.query_engine.get_disease_profile(
                disease_id=kwargs.get("disease_id")
            )

        elif query_type == "text_search":
            return self.query_engine.search_by_text(
                search_text=kwargs.get("search_text"),
                entity_types=kwargs.get("entity_types"),
                limit=kwargs.get("limit", 10),
            )

        elif query_type == "graph_statistics":
            return self.query_engine.get_graph_statistics()

        else:
            raise ValueError(f"Unknown query type: {query_type}")

    def print_results(self, result: QueryResult):
        """Pretty print query results."""
        print("\n" + "=" * 60)
        print(f"📊 QUERY RESULTS: {result.query_type.upper()}")
        print("=" * 60)
        print(f"⏱️  Execution Time: {result.execution_time:.3f} seconds")
        print(f"📈 Total Results: {result.total_count}")

        if result.metadata:
            print(f"🔍 Query Parameters: {result.metadata}")

        print("\n" + "-" * 60)

        # Format results based on query type
        if result.query_type == "diseases_by_symptoms":
            for i, disease in enumerate(result.results, 1):
                print(f"{i}. {disease['disease_name']}")
                print(f"   ID: {disease['disease_id']}")
                print(f"   Matching Symptoms: {disease['matching_symptoms']}")
                print(f"   Relevance: {disease['relevance_score']:.2f}")
                print(f"   Description: {disease['description'][:100]}...")
                print()

        elif result.query_type == "similar_diseases":
            for i, disease in enumerate(result.results, 1):
                print(f"{i}. {disease['disease_name']}")
                print(f"   Similarity Score: {disease['similarity_score']:.3f}")
                print(f"   Type: {disease['similarity_type']}")
                print(f"   Description: {disease['description'][:100]}...")
                print()

        elif result.query_type == "symptom_patterns":
            for i, pattern in enumerate(result.results, 1):
                print(f"{i}. {pattern['symptom1']} + {pattern['symptom2']}")
                print(f"   Co-occurrence: {pattern['co_occurrence_count']} diseases")
                print(f"   Pattern Strength: {pattern['pattern_strength']:.2f}")
                print()

        elif result.query_type == "disease_profile":
            if result.results:
                disease = result.results[0]
                print(f"Disease: {disease['disease_name']}")
                print(f"ID: {disease['disease_id']}")
                print(f"Description: {disease['description']}")
                print(f"Symptoms ({disease['symptom_count']}):")
                for symptom in disease["symptoms"][:10]:  # Show first 10
                    print(f"  • {symptom}")
                if len(disease["symptoms"]) > 10:
                    print(f"  ... and {len(disease['symptoms']) - 10} more")
                print(f"Similar Diseases ({disease['similar_count']}):")
                for similar in disease["similar_diseases"][:5]:
                    print(f"  • {similar}")

        elif result.query_type == "text_search":
            for i, item in enumerate(result.results, 1):
                print(f"{i}. {item['entity_name']} ({item['entity_type']})")
                print(f"   Relevance: {item['relevance_score']}")
                print(f"   Description: {item['description'][:100]}...")
                print()

        elif result.query_type == "graph_statistics":
            stats = result.results[0]

            print("📊 Node Statistics:")
            for node_stat in stats.get("node_counts", []):
                print(f"   • {node_stat['node_type']}: {node_stat['count']:,}")

            print("\n🔗 Relationship Statistics:")
            for rel_stat in stats.get("relationship_counts", []):
                print(f"   • {rel_stat['relationship_type']}: {rel_stat['count']:,}")

            print("\n🌟 Most Connected Entities:")
            for entity in stats.get("most_connected", []):
                print(
                    f"   • {entity['entity_name']} ({entity['entity_type']}): {entity['connection_count']} connections"
                )

            print("\n🔥 Most Common Symptoms:")
            for symptom in stats.get("most_common_symptoms", []):
                print(f"   • {symptom['symptom']}: {symptom['disease_count']} diseases")

        print("=" * 60)


def main():
    """Interactive query demonstration."""
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )

    if not NEO4J_AVAILABLE:
        logging.error(
            "❌ Neo4j driver not available. Please install: pip install neo4j"
        )
        return

    # Connect to Neo4j
    try:
        driver = GraphDatabase.driver(
            settings.neo4j.uri, auth=(settings.neo4j.username, settings.neo4j.password)
        )

        # Test connection
        with driver.session() as session:
            session.run("RETURN 1")

        logging.info("✅ Connected to Neo4j")

    except Exception as e:
        logging.error(f"❌ Failed to connect to Neo4j: {e}")
        return

    # Create query interface
    query_interface = QueryInterface(driver)

    # Demonstration queries
    demo_queries = [
        {"name": "Graph Statistics", "type": "graph_statistics"},
        {
            "name": "Search for 'diabetes'",
            "type": "text_search",
            "search_text": "diabetes",
        },
        {
            "name": "Find diseases with fever and fatigue",
            "type": "diseases_by_symptoms",
            "symptoms": ["fever", "fatigue"],
        },
        {"name": "Common symptom patterns", "type": "symptom_patterns", "limit": 10},
    ]

    print("🚀 Medical Knowledge Graph Query Demonstration")

    for demo in demo_queries:
        try:
            print(f"\n🔍 Executing: {demo['name']}")

            query_params = {k: v for k, v in demo.items() if k not in ["name", "type"]}
            result = query_interface.execute_query(demo["type"], **query_params)

            query_interface.print_results(result)

        except Exception as e:
            logging.error(f"❌ Demo query failed: {e}")

    driver.close()
    print("\n✅ Query demonstration completed!")


if __name__ == "__main__":
    main()
