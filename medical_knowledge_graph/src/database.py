"""
Medical Knowledge Graph Database Connection and Setup

This module handles Neo4j database connections, schema creation, and basic operations.
"""

import sqlite3
from typing import Optional, Dict, List, Any, Tuple
from pathlib import Path
import logging
from contextlib import contextmanager

try:
    from neo4j import GraphDatabase, Session

    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    print("Warning: Neo4j driver not available. Install with: pip install neo4j")

from config.settings import settings, CYPHER_QUERIES


class DatabaseConnection:
    """Handles connections to both SQLite source and Neo4j target databases."""

    def __init__(self):
        self.neo4j_driver = None
        self.sqlite_path = (
            settings.data_dir / settings.data.sqlite_db_path.split("/")[-1]
        )

        if NEO4J_AVAILABLE:
            self._connect_neo4j()
        else:
            logging.warning(
                "Neo4j driver not available. Some functionality will be limited."
            )

    def _connect_neo4j(self):
        """Establish Neo4j connection."""
        try:
            self.neo4j_driver = GraphDatabase.driver(
                settings.neo4j.uri,
                auth=(settings.neo4j.username, settings.neo4j.password),
                max_connection_lifetime=settings.neo4j.max_connection_lifetime,
                max_connection_pool_size=settings.neo4j.max_connection_pool_size,
                connection_acquisition_timeout=settings.neo4j.connection_acquisition_timeout,
            )

            # Test connection
            with self.neo4j_driver.session() as session:
                result = session.run("RETURN 1 as test")
                test_value = result.single()["test"]
                if test_value == 1:
                    logging.info("✅ Successfully connected to Neo4j database")
                else:
                    raise ConnectionError("Neo4j connection test failed")

        except Exception as e:
            logging.error(f"❌ Failed to connect to Neo4j: {e}")
            self.neo4j_driver = None

    @contextmanager
    def neo4j_session(self):
        """Context manager for Neo4j sessions."""
        if not self.neo4j_driver:
            raise ConnectionError("Neo4j driver not available")

        session = self.neo4j_driver.session()
        try:
            yield session
        finally:
            session.close()

    @contextmanager
    def sqlite_connection(self):
        """Context manager for SQLite connections."""
        if not self.sqlite_path.exists():
            raise FileNotFoundError(f"SQLite database not found at: {self.sqlite_path}")

        conn = sqlite3.connect(str(self.sqlite_path))
        conn.row_factory = sqlite3.Row  # Enable column access by name
        try:
            yield conn
        finally:
            conn.close()

    def close(self):
        """Close all database connections."""
        if self.neo4j_driver:
            self.neo4j_driver.close()
            logging.info("Neo4j connection closed")


class SchemaSetup:
    """Handles Neo4j schema creation and management."""

    def __init__(self, db_connection: DatabaseConnection):
        self.db = db_connection

    def create_constraints(self) -> bool:
        """Create uniqueness constraints for node properties."""
        if not self.db.neo4j_driver:
            logging.error("Neo4j not available for constraint creation")
            return False

        try:
            with self.db.neo4j_session() as session:
                for constraint_name, query in CYPHER_QUERIES[
                    "create_constraints"
                ].items():
                    try:
                        session.run(query)
                        logging.info(f"✅ Created constraint: {constraint_name}")
                    except Exception as e:
                        if "already exists" in str(e).lower():
                            logging.info(
                                f"ℹ️  Constraint already exists: {constraint_name}"
                            )
                        else:
                            logging.error(
                                f"❌ Failed to create constraint {constraint_name}: {e}"
                            )
                            return False

            return True

        except Exception as e:
            logging.error(f"❌ Failed to create constraints: {e}")
            return False

    def create_indexes(self) -> bool:
        """Create performance indexes."""
        if not self.db.neo4j_driver:
            logging.error("Neo4j not available for index creation")
            return False

        try:
            with self.db.neo4j_session() as session:
                for index_name, query in CYPHER_QUERIES["create_indexes"].items():
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
            logging.error(f"❌ Failed to create indexes: {e}")
            return False

    def setup_schema(self) -> bool:
        """Complete schema setup with constraints and indexes."""
        logging.info("🚀 Setting up Neo4j schema...")

        success = True
        success &= self.create_constraints()
        success &= self.create_indexes()

        if success:
            logging.info("✅ Schema setup completed successfully")
        else:
            logging.error("❌ Schema setup failed")

        return success


class SQLiteAnalyzer:
    """Analyzes the source SQLite database structure and content."""

    def __init__(self, db_connection: DatabaseConnection):
        self.db = db_connection

    def get_table_info(self) -> Dict[str, Any]:
        """Get detailed information about SQLite database tables."""
        table_info = {}

        try:
            with self.db.sqlite_connection() as conn:
                cursor = conn.cursor()

                # Get all table names
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]

                for table in tables:
                    # Get table schema
                    cursor.execute(f"PRAGMA table_info({table})")
                    columns = cursor.fetchall()

                    # Get row count
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    row_count = cursor.fetchone()[0]

                    # Get sample data
                    cursor.execute(f"SELECT * FROM {table} LIMIT 5")
                    sample_data = cursor.fetchall()

                    table_info[table] = {
                        "columns": [
                            {
                                "name": col[1],
                                "type": col[2],
                                "not_null": bool(col[3]),
                                "primary_key": bool(col[5]),
                            }
                            for col in columns
                        ],
                        "row_count": row_count,
                        "sample_data": [dict(row) for row in sample_data]
                        if sample_data
                        else [],
                    }

                return table_info

        except Exception as e:
            logging.error(f"❌ Failed to analyze SQLite database: {e}")
            return {}

    def print_database_summary(self):
        """Print a comprehensive summary of the SQLite database."""
        print("\n" + "=" * 60)
        print("📊 MEDICAL DATABASE ANALYSIS")
        print("=" * 60)

        table_info = self.get_table_info()

        if not table_info:
            print("❌ No table information available")
            return

        total_rows = sum(info["row_count"] for info in table_info.values())
        print(f"\n📈 Database Summary:")
        print(f"   • Total Tables: {len(table_info)}")
        print(f"   • Total Records: {total_rows:,}")

        for table_name, info in table_info.items():
            print(f"\n🗂️  Table: {table_name}")
            print(f"   📊 Rows: {info['row_count']:,}")
            print(f"   🏗️  Columns: {len(info['columns'])}")

            # Show column details
            for col in info["columns"]:
                pk_indicator = " (PK)" if col["primary_key"] else ""
                nn_indicator = " NOT NULL" if col["not_null"] else ""
                print(
                    f"      • {col['name']}: {col['type']}{pk_indicator}{nn_indicator}"
                )

            # Show sample data if available
            if info["sample_data"]:
                print(f"   📝 Sample Data:")
                for i, row in enumerate(info["sample_data"][:3], 1):
                    print(f"      {i}. {dict(row)}")

        print("\n" + "=" * 60)


class GraphAnalyzer:
    """Analyzes the Neo4j knowledge graph."""

    def __init__(self, db_connection: DatabaseConnection):
        self.db = db_connection

    def get_graph_stats(self) -> Dict[str, Any]:
        """Get comprehensive graph statistics."""
        if not self.db.neo4j_driver:
            return {"error": "Neo4j not available"}

        stats = {}

        try:
            with self.db.neo4j_session() as session:
                # Node counts by label
                result = session.run("""
                    MATCH (n)
                    RETURN labels(n) as labels, count(n) as count
                    ORDER BY count DESC
                """)

                node_counts = {}
                total_nodes = 0
                for record in result:
                    labels = record["labels"]
                    count = record["count"]
                    if labels:
                        label = labels[0]  # Use first label
                        node_counts[label] = count
                        total_nodes += count

                stats["nodes"] = {"total": total_nodes, "by_type": node_counts}

                # Relationship counts by type
                result = session.run("""
                    MATCH ()-[r]->()
                    RETURN type(r) as relationship_type, count(r) as count
                    ORDER BY count DESC
                """)

                rel_counts = {}
                total_rels = 0
                for record in result:
                    rel_type = record["relationship_type"]
                    count = record["count"]
                    rel_counts[rel_type] = count
                    total_rels += count

                stats["relationships"] = {"total": total_rels, "by_type": rel_counts}

                # Graph density and connectivity
                if total_nodes > 0:
                    max_possible_edges = total_nodes * (total_nodes - 1)
                    density = (
                        total_rels / max_possible_edges if max_possible_edges > 0 else 0
                    )
                    stats["density"] = density

                return stats

        except Exception as e:
            logging.error(f"❌ Failed to get graph statistics: {e}")
            return {"error": str(e)}

    def print_graph_summary(self):
        """Print a comprehensive summary of the knowledge graph."""
        print("\n" + "=" * 60)
        print("🕸️  KNOWLEDGE GRAPH ANALYSIS")
        print("=" * 60)

        stats = self.get_graph_stats()

        if "error" in stats:
            print(f"❌ Error: {stats['error']}")
            return

        # Nodes summary
        print(f"\n🔵 Nodes:")
        print(f"   Total: {stats['nodes']['total']:,}")
        for node_type, count in stats["nodes"]["by_type"].items():
            percentage = (count / stats["nodes"]["total"]) * 100
            print(f"   • {node_type}: {count:,} ({percentage:.1f}%)")

        # Relationships summary
        print(f"\n🔗 Relationships:")
        print(f"   Total: {stats['relationships']['total']:,}")
        for rel_type, count in stats["relationships"]["by_type"].items():
            percentage = (count / stats["relationships"]["total"]) * 100
            print(f"   • {rel_type}: {count:,} ({percentage:.1f}%)")

        # Graph metrics
        if "density" in stats:
            print(f"\n📈 Graph Metrics:")
            print(f"   • Density: {stats['density']:.6f}")
            avg_degree = (
                (stats["relationships"]["total"] * 2) / stats["nodes"]["total"]
                if stats["nodes"]["total"] > 0
                else 0
            )
            print(f"   • Average Degree: {avg_degree:.2f}")

        print("\n" + "=" * 60)


def initialize_system() -> Tuple[DatabaseConnection, bool]:
    """Initialize the complete knowledge graph system."""
    print("🚀 Initializing Medical Knowledge Graph System...")

    # Create database connection
    db_connection = DatabaseConnection()

    # Analyze source database
    print("\n📊 Analyzing source SQLite database...")
    sqlite_analyzer = SQLiteAnalyzer(db_connection)
    sqlite_analyzer.print_database_summary()

    # Setup Neo4j schema if available
    success = True
    if NEO4J_AVAILABLE and db_connection.neo4j_driver:
        print("\n🏗️  Setting up Neo4j schema...")
        schema_setup = SchemaSetup(db_connection)
        success = schema_setup.setup_schema()
    else:
        print("\n⚠️  Neo4j not available - schema setup skipped")
        success = False

    return db_connection, success


if __name__ == "__main__":
    # Setup logging
    import logging

    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )

    # Initialize system
    db_conn, setup_success = initialize_system()

    if setup_success:
        print("\n✅ System initialization completed successfully!")

        # Show graph stats if Neo4j is available
        if db_conn.neo4j_driver:
            graph_analyzer = GraphAnalyzer(db_conn)
            graph_analyzer.print_graph_summary()
    else:
        print("\n⚠️  System initialization completed with warnings")

    # Cleanup
    db_conn.close()
