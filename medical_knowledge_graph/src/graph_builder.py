"""
Neo4j Graph Builder

This module handles the creation and population of the Neo4j knowledge graph
with medical entities and relationships.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import asdict
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from neo4j import GraphDatabase

    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    logging.warning("Neo4j driver not available. Install with: pip install neo4j")

from config.settings import settings, CYPHER_QUERIES
from data_processor import MedicalEntity, MedicalRelationship


class GraphBuilder:
    """Builds and populates Neo4j knowledge graph with medical data."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver
        self.batch_size = settings.data.batch_size

        # Statistics
        self.stats = {
            "nodes_created": 0,
            "relationships_created": 0,
            "errors": 0,
            "start_time": None,
            "end_time": None,
        }

    def clear_graph(self) -> bool:
        """Clear all existing data from the graph."""
        if not self.driver:
            logging.error("Neo4j driver not available")
            return False

        try:
            with self.driver.session() as session:
                # Delete all relationships first
                result = session.run("MATCH ()-[r]->() DELETE r")
                logging.info("🗑️  Cleared all relationships")

                # Then delete all nodes
                result = session.run("MATCH (n) DELETE n")
                logging.info("🗑️  Cleared all nodes")

                return True

        except Exception as e:
            logging.error(f"❌ Failed to clear graph: {e}")
            return False

    def create_node_batch(
        self, entities: List[MedicalEntity], batch_start: int
    ) -> Tuple[int, int]:
        """Create a batch of nodes in Neo4j."""
        created_count = 0
        error_count = 0

        batch_end = min(batch_start + self.batch_size, len(entities))
        batch = entities[batch_start:batch_end]

        try:
            with self.driver.session() as session:
                for entity in batch:
                    try:
                        # Prepare node properties
                        properties = {
                            "id": entity.id,
                            "name": entity.name,
                            "description": entity.description,
                            "type": entity.type,
                        }

                        # Add metadata as properties
                        for key, value in entity.metadata.items():
                            if isinstance(value, (str, int, float, bool)):
                                properties[key] = value
                            elif isinstance(value, (list, dict)):
                                properties[key] = str(
                                    value
                                )  # Convert to string for storage

                        # Add embedding if available
                        if entity.embedding and len(entity.embedding) > 0:
                            properties["embedding"] = entity.embedding
                            properties["has_embedding"] = True
                        else:
                            properties["has_embedding"] = False

                        # Create node based on entity type
                        if entity.type == "disease":
                            query = """
                            MERGE (d:Disease {id: $id})
                            SET d += $properties,
                                d.created_at = datetime(),
                                d.updated_at = datetime()
                            RETURN d
                            """
                            session.run(
                                query, {"id": entity.id, "properties": properties}
                            )

                        elif entity.type == "symptom":
                            query = """
                            MERGE (s:Symptom {id: $id})
                            SET s += $properties,
                                s.created_at = datetime(),
                                s.updated_at = datetime()
                            RETURN s
                            """
                            session.run(
                                query, {"id": entity.id, "properties": properties}
                            )

                        else:
                            # Generic node creation
                            query = f"""
                            MERGE (n:{entity.type.title()} {{id: $id}})
                            SET n += $properties,
                                n.created_at = datetime(),
                                n.updated_at = datetime()
                            RETURN n
                            """
                            session.run(
                                query, {"id": entity.id, "properties": properties}
                            )

                        created_count += 1

                    except Exception as e:
                        logging.error(f"❌ Failed to create node {entity.id}: {e}")
                        error_count += 1

        except Exception as e:
            logging.error(f"❌ Batch creation failed: {e}")
            error_count += len(batch)

        return created_count, error_count

    def create_nodes_parallel(self, entities: List[MedicalEntity]) -> bool:
        """Create nodes using parallel processing."""
        logging.info(f"🏗️  Creating {len(entities)} nodes in parallel batches...")

        total_created = 0
        total_errors = 0

        # Process in batches with parallel execution
        with ThreadPoolExecutor(max_workers=settings.data.max_workers) as executor:
            futures = []

            for batch_start in range(0, len(entities), self.batch_size):
                future = executor.submit(self.create_node_batch, entities, batch_start)
                futures.append(future)

            # Collect results
            for future in as_completed(futures):
                try:
                    created, errors = future.result()
                    total_created += created
                    total_errors += errors

                    if created > 0:
                        logging.info(f"✅ Batch completed: {created} nodes created")

                except Exception as e:
                    logging.error(f"❌ Batch execution failed: {e}")
                    total_errors += self.batch_size

        self.stats["nodes_created"] = total_created
        self.stats["errors"] += total_errors

        success_rate = (total_created / len(entities)) * 100 if entities else 0
        logging.info(
            f"📊 Node creation completed: {total_created}/{len(entities)} ({success_rate:.1f}%)"
        )

        return total_errors == 0

    def create_relationship_batch(
        self, relationships: List[MedicalRelationship], batch_start: int
    ) -> Tuple[int, int]:
        """Create a batch of relationships in Neo4j."""
        created_count = 0
        error_count = 0

        batch_end = min(batch_start + self.batch_size, len(relationships))
        batch = relationships[batch_start:batch_end]

        try:
            with self.driver.session() as session:
                for rel in batch:
                    try:
                        # Generic relationship creation query
                        query = f"""
                        MATCH (source {{id: $source_id}})
                        MATCH (target {{id: $target_id}})
                        MERGE (source)-[r:{rel.relationship_type}]->(target)
                        SET r += $properties,
                            r.created_at = datetime()
                        RETURN r
                        """

                        session.run(
                            query,
                            {
                                "source_id": rel.source_id,
                                "target_id": rel.target_id,
                                "properties": rel.properties,
                            },
                        )

                        created_count += 1

                    except Exception as e:
                        logging.error(
                            f"❌ Failed to create relationship {rel.source_id}->{rel.target_id}: {e}"
                        )
                        error_count += 1

        except Exception as e:
            logging.error(f"❌ Relationship batch creation failed: {e}")
            error_count += len(batch)

        return created_count, error_count

    def create_relationships_parallel(
        self, relationships: List[MedicalRelationship]
    ) -> bool:
        """Create relationships using parallel processing."""
        logging.info(
            f"🔗 Creating {len(relationships)} relationships in parallel batches..."
        )

        total_created = 0
        total_errors = 0

        # Process in batches with parallel execution
        with ThreadPoolExecutor(max_workers=settings.data.max_workers) as executor:
            futures = []

            for batch_start in range(0, len(relationships), self.batch_size):
                future = executor.submit(
                    self.create_relationship_batch, relationships, batch_start
                )
                futures.append(future)

            # Collect results
            for future in as_completed(futures):
                try:
                    created, errors = future.result()
                    total_created += created
                    total_errors += errors

                    if created > 0:
                        logging.info(
                            f"✅ Relationship batch completed: {created} relationships created"
                        )

                except Exception as e:
                    logging.error(f"❌ Relationship batch execution failed: {e}")
                    total_errors += self.batch_size

        self.stats["relationships_created"] = total_created
        self.stats["errors"] += total_errors

        success_rate = (
            (total_created / len(relationships)) * 100 if relationships else 0
        )
        logging.info(
            f"📊 Relationship creation completed: {total_created}/{len(relationships)} ({success_rate:.1f}%)"
        )

        return total_errors == 0

    def build_graph(
        self,
        entities: List[MedicalEntity],
        relationships: List[MedicalRelationship],
        clear_existing: bool = True,
    ) -> bool:
        """Build the complete knowledge graph."""
        logging.info("🚀 Starting knowledge graph construction...")

        self.stats["start_time"] = time.time()

        try:
            # Clear existing data if requested
            if clear_existing:
                logging.info("🗑️  Clearing existing graph data...")
                if not self.clear_graph():
                    logging.error("❌ Failed to clear existing graph")
                    return False

            # Create nodes
            logging.info("📦 Creating nodes...")
            if not self.create_nodes_parallel(entities):
                logging.warning("⚠️  Some nodes failed to create")

            # Create relationships
            logging.info("🔗 Creating relationships...")
            if not self.create_relationships_parallel(relationships):
                logging.warning("⚠️  Some relationships failed to create")

            self.stats["end_time"] = time.time()
            self._print_build_summary()

            return True

        except Exception as e:
            logging.error(f"❌ Graph building failed: {e}")
            self.stats["end_time"] = time.time()
            return False

    def _print_build_summary(self):
        """Print summary of graph building process."""
        duration = self.stats["end_time"] - self.stats["start_time"]

        print("\n" + "=" * 60)
        print("🎉 KNOWLEDGE GRAPH BUILD COMPLETE")
        print("=" * 60)
        print(f"⏱️  Build Duration: {duration:.2f} seconds")
        print(f"🏗️  Nodes Created: {self.stats['nodes_created']:,}")
        print(f"🔗 Relationships Created: {self.stats['relationships_created']:,}")

        if self.stats["errors"] > 0:
            print(f"⚠️  Errors: {self.stats['errors']}")

        # Performance metrics
        if duration > 0:
            nodes_per_sec = self.stats["nodes_created"] / duration
            rels_per_sec = self.stats["relationships_created"] / duration
            print(f"📈 Performance:")
            print(f"   • Nodes/second: {nodes_per_sec:.1f}")
            print(f"   • Relationships/second: {rels_per_sec:.1f}")

        print("=" * 60)


class GraphOptimizer:
    """Optimizes the knowledge graph structure and performance."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def create_additional_indexes(self) -> bool:
        """Create additional performance indexes."""
        indexes = {
            "disease_description": "CREATE INDEX disease_description IF NOT EXISTS FOR (d:Disease) ON (d.description)",
            "symptom_description": "CREATE INDEX symptom_description IF NOT EXISTS FOR (s:Symptom) ON (s.description)",
            "entity_type": "CREATE INDEX entity_type IF NOT EXISTS FOR (n) ON (n.type)",
            "has_embedding": "CREATE INDEX has_embedding IF NOT EXISTS FOR (n) ON (n.has_embedding)",
        }

        try:
            with self.driver.session() as session:
                for index_name, query in indexes.items():
                    try:
                        session.run(query)
                        logging.info(f"✅ Created index: {index_name}")
                    except Exception as e:
                        if "already exists" in str(e).lower():
                            logging.info(f"ℹ️  Index already exists: {index_name}")
                        else:
                            logging.error(
                                f"❌ Failed to create index {index_name}: {e}"
                            )
                            return False

            return True

        except Exception as e:
            logging.error(f"❌ Failed to create additional indexes: {e}")
            return False

    def calculate_graph_statistics(self) -> Dict[str, Any]:
        """Calculate comprehensive graph statistics."""
        stats = {}

        try:
            with self.driver.session() as session:
                # Basic counts
                result = session.run("MATCH (n) RETURN count(n) as node_count")
                stats["total_nodes"] = result.single()["node_count"]

                result = session.run("MATCH ()-[r]->() RETURN count(r) as rel_count")
                stats["total_relationships"] = result.single()["rel_count"]

                # Node type distribution
                result = session.run("""
                    MATCH (n)
                    RETURN labels(n)[0] as label, count(n) as count
                    ORDER BY count DESC
                """)
                stats["node_types"] = {
                    record["label"]: record["count"] for record in result
                }

                # Relationship type distribution
                result = session.run("""
                    MATCH ()-[r]->()
                    RETURN type(r) as rel_type, count(r) as count
                    ORDER BY count DESC
                """)
                stats["relationship_types"] = {
                    record["rel_type"]: record["count"] for record in result
                }

                # Graph connectivity
                result = session.run("""
                    MATCH (n)
                    OPTIONAL MATCH (n)-[r]-()
                    RETURN n.id as node_id, count(r) as degree
                    ORDER BY degree DESC
                    LIMIT 10
                """)
                stats["top_connected_nodes"] = [
                    {"id": record["node_id"], "degree": record["degree"]}
                    for record in result
                ]

                return stats

        except Exception as e:
            logging.error(f"❌ Failed to calculate graph statistics: {e}")
            return {}


def main():
    """Main function to build the knowledge graph."""
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

    try:
        # Load processed data (would normally come from data_processor)
        from data_processor import MedicalDataExtractor

        db_path = settings.data_dir / "medical_symptoms.db"
        extractor = MedicalDataExtractor(str(db_path))

        logging.info("📊 Processing medical data...")
        entities, relationships = extractor.process_all_data()

        # Build graph
        builder = GraphBuilder(driver)
        success = builder.build_graph(entities, relationships)

        if success:
            # Optimize graph
            optimizer = GraphOptimizer(driver)
            optimizer.create_additional_indexes()

            # Show final statistics
            final_stats = optimizer.calculate_graph_statistics()

            print("\n" + "=" * 60)
            print("📊 FINAL GRAPH STATISTICS")
            print("=" * 60)
            print(f"🔵 Total Nodes: {final_stats.get('total_nodes', 0):,}")
            print(
                f"🔗 Total Relationships: {final_stats.get('total_relationships', 0):,}"
            )

            if "node_types" in final_stats:
                print("\n🏷️  Node Types:")
                for node_type, count in final_stats["node_types"].items():
                    print(f"   • {node_type}: {count:,}")

            if "relationship_types" in final_stats:
                print("\n🔗 Relationship Types:")
                for rel_type, count in final_stats["relationship_types"].items():
                    print(f"   • {rel_type}: {count:,}")

            print("=" * 60)
            print("✅ Knowledge graph successfully created!")

        else:
            logging.error("❌ Failed to build knowledge graph")

    except Exception as e:
        logging.error(f"❌ Main execution failed: {e}")

    finally:
        driver.close()


if __name__ == "__main__":
    main()
