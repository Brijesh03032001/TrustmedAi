"""
Medical Knowledge Graph System - Main Application

This is the main entry point for the Medical Knowledge Graph System.
It provides a comprehensive interface to build, query, and analyze the knowledge graph.
"""

import sys
import logging
from pathlib import Path
import argparse
from typing import Optional
import time

# Add src to Python path for imports
sys.path.append(str(Path(__file__).parent / "src"))

try:
    from neo4j import GraphDatabase

    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False

# Local imports
from src.database import DatabaseConnection, initialize_system
from src.data_processor import MedicalDataExtractor
from src.graph_builder import GraphBuilder, GraphOptimizer
from src.query_engine import QueryInterface
from config.settings import settings


class MedicalKnowledgeGraphApp:
    """Main application class for the Medical Knowledge Graph System."""

    def __init__(self):
        self.db_connection = None
        self.query_interface = None

        # Setup logging
        self._setup_logging()
        logging.info("🚀 Initializing Medical Knowledge Graph System...")

        # Initialize database connections
        self._initialize_database()

    def _setup_logging(self):
        """Setup comprehensive logging system."""

        # Create logs directory
        settings.logs_dir.mkdir(exist_ok=True)

        # Configure logging
        logging.basicConfig(
            level=getattr(logging, settings.logging.log_level),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(settings.logs_dir / "medical_kg.log"),
                logging.StreamHandler(sys.stdout),
            ],
        )

        # Set up loggers for different modules
        loggers = ["neo4j", "urllib3", "transformers", "sentence_transformers"]
        for logger_name in loggers:
            logger = logging.getLogger(logger_name)
            logger.setLevel(logging.WARNING)

    def _initialize_database(self):
        """Initialize database connections and setup."""
        try:
            self.db_connection, setup_success = initialize_system()

            if setup_success and self.db_connection.neo4j_driver:
                self.query_interface = QueryInterface(self.db_connection.neo4j_driver)
                logging.info("✅ System initialization completed successfully")
            else:
                logging.warning(
                    "⚠️  System initialized with limitations (Neo4j not available)"
                )

        except Exception as e:
            logging.error(f"❌ Failed to initialize system: {e}")
            raise

    def build_knowledge_graph(self, clear_existing: bool = True) -> bool:
        """Build the complete knowledge graph from SQLite data."""
        logging.info("🏗️  Starting knowledge graph construction...")

        if not self.db_connection or not self.db_connection.neo4j_driver:
            logging.error("❌ Neo4j not available for graph building")
            return False

        try:
            # Extract and process data
            logging.info("📊 Extracting medical data from SQLite...")
            db_path = settings.data_dir / "medical_symptoms.db"
            extractor = MedicalDataExtractor(str(db_path))

            entities, relationships = extractor.process_all_data()

            # Export processed data for inspection
            extractor.export_to_json(entities, relationships)

            # Build Neo4j graph
            logging.info("🏗️  Building Neo4j knowledge graph...")
            builder = GraphBuilder(self.db_connection.neo4j_driver)
            success = builder.build_graph(entities, relationships, clear_existing)

            if success:
                # Optimize graph
                logging.info("⚡ Optimizing graph performance...")
                optimizer = GraphOptimizer(self.db_connection.neo4j_driver)
                optimizer.create_additional_indexes()

                # Show final statistics
                final_stats = optimizer.calculate_graph_statistics()
                self._print_build_summary(final_stats)

                return True
            else:
                logging.error("❌ Failed to build knowledge graph")
                return False

        except Exception as e:
            logging.error(f"❌ Knowledge graph building failed: {e}")
            return False

    def _print_build_summary(self, stats: dict):
        """Print comprehensive build summary."""
        print("\n" + "=" * 70)
        print("🎉 MEDICAL KNOWLEDGE GRAPH SUCCESSFULLY CREATED")
        print("=" * 70)

        if stats:
            print(f"📊 Graph Statistics:")
            print(f"   🔵 Total Nodes: {stats.get('total_nodes', 0):,}")
            print(f"   🔗 Total Relationships: {stats.get('total_relationships', 0):,}")

            if "node_types" in stats:
                print(f"\n🏷️  Node Distribution:")
                for node_type, count in stats["node_types"].items():
                    print(f"     • {node_type}: {count:,}")

            if "relationship_types" in stats:
                print(f"\n🔗 Relationship Distribution:")
                for rel_type, count in stats["relationship_types"].items():
                    print(f"     • {rel_type}: {count:,}")

            # Calculate graph density
            total_nodes = stats.get("total_nodes", 0)
            total_rels = stats.get("total_relationships", 0)
            if total_nodes > 1:
                max_possible = total_nodes * (total_nodes - 1)
                density = total_rels / max_possible
                avg_degree = (total_rels * 2) / total_nodes

                print(f"\n📈 Graph Metrics:")
                print(f"     • Density: {density:.6f}")
                print(f"     • Average Degree: {avg_degree:.2f}")

        print(f"\n✨ The knowledge graph is ready for queries and analysis!")
        print("=" * 70)

    def interactive_query_session(self):
        """Start an interactive query session."""
        if not self.query_interface:
            print("❌ Query interface not available. Please build the graph first.")
            return

        print("\n" + "=" * 60)
        print("🔍 MEDICAL KNOWLEDGE GRAPH QUERY INTERFACE")
        print("=" * 60)
        print("Available query types:")
        print("1. diseases_by_symptoms - Find diseases matching symptoms")
        print("2. similar_diseases - Find diseases similar to a given disease")
        print("3. symptom_patterns - Find common symptom co-occurrences")
        print("4. disease_profile - Get comprehensive disease information")
        print("5. text_search - Search entities by text")
        print("6. graph_statistics - Get graph statistics")
        print("7. exit - Exit the query session")
        print("=" * 60)

        while True:
            try:
                print("\n🔍 Enter query type (or 'exit' to quit):")
                query_type = input("> ").strip().lower()

                if query_type == "exit":
                    print("👋 Goodbye!")
                    break

                elif query_type == "1" or query_type == "diseases_by_symptoms":
                    symptoms = input("Enter symptoms (comma-separated): ").strip()
                    symptom_list = [s.strip() for s in symptoms.split(",") if s.strip()]

                    if symptom_list:
                        result = self.query_interface.execute_query(
                            "diseases_by_symptoms", symptoms=symptom_list
                        )
                        self.query_interface.print_results(result)

                elif query_type == "2" or query_type == "similar_diseases":
                    disease_id = input("Enter disease ID: ").strip()
                    if disease_id:
                        result = self.query_interface.execute_query(
                            "similar_diseases", disease_id=disease_id
                        )
                        self.query_interface.print_results(result)

                elif query_type == "3" or query_type == "symptom_patterns":
                    result = self.query_interface.execute_query("symptom_patterns")
                    self.query_interface.print_results(result)

                elif query_type == "4" or query_type == "disease_profile":
                    disease_id = input("Enter disease ID: ").strip()
                    if disease_id:
                        result = self.query_interface.execute_query(
                            "disease_profile", disease_id=disease_id
                        )
                        self.query_interface.print_results(result)

                elif query_type == "5" or query_type == "text_search":
                    search_text = input("Enter search text: ").strip()
                    if search_text:
                        result = self.query_interface.execute_query(
                            "text_search", search_text=search_text
                        )
                        self.query_interface.print_results(result)

                elif query_type == "6" or query_type == "graph_statistics":
                    result = self.query_interface.execute_query("graph_statistics")
                    self.query_interface.print_results(result)

                else:
                    print("❌ Unknown query type. Please try again.")

            except KeyboardInterrupt:
                print("\n👋 Session interrupted. Goodbye!")
                break
            except Exception as e:
                logging.error(f"❌ Query execution failed: {e}")
                print(f"❌ Error: {e}")

    def run_demo_queries(self):
        """Run a set of demonstration queries."""
        if not self.query_interface:
            print("❌ Query interface not available. Please build the graph first.")
            return

        demo_queries = [
            {
                "name": "📊 Graph Overview",
                "type": "graph_statistics",
                "description": "Get comprehensive graph statistics",
            },
            {
                "name": "🔍 Search for Diabetes",
                "type": "text_search",
                "search_text": "diabetes",
                "description": "Find all entities related to diabetes",
            },
            {
                "name": "🤒 Diseases with Fever and Headache",
                "type": "diseases_by_symptoms",
                "symptoms": ["fever", "headache"],
                "description": "Find diseases that cause both fever and headache",
            },
            {
                "name": "📋 Common Symptom Patterns",
                "type": "symptom_patterns",
                "limit": 10,
                "description": "Discover frequently co-occurring symptoms",
            },
        ]

        print("\n" + "=" * 70)
        print("🚀 MEDICAL KNOWLEDGE GRAPH DEMONSTRATION")
        print("=" * 70)

        for i, demo in enumerate(demo_queries, 1):
            try:
                print(f"\n{i}. {demo['name']}")
                print(f"   Description: {demo['description']}")
                print(f"   ⏳ Executing query...")

                start_time = time.time()

                query_params = {
                    k: v
                    for k, v in demo.items()
                    if k not in ["name", "type", "description"]
                }
                result = self.query_interface.execute_query(
                    demo["type"], **query_params
                )

                execution_time = time.time() - start_time
                print(f"   ⚡ Completed in {execution_time:.3f} seconds")

                self.query_interface.print_results(result)

                # Pause between queries
                if i < len(demo_queries):
                    input("\n   Press Enter to continue to the next query...")

            except Exception as e:
                logging.error(f"❌ Demo query failed: {e}")
                print(f"   ❌ Error: {e}")

        print("\n" + "=" * 70)
        print("✅ DEMONSTRATION COMPLETED")
        print("=" * 70)

    def analyze_source_data(self):
        """Analyze the source SQLite database."""
        if not self.db_connection:
            print("❌ Database connection not available")
            return

        from src.database import SQLiteAnalyzer

        analyzer = SQLiteAnalyzer(self.db_connection)
        analyzer.print_database_summary()

    def close(self):
        """Clean up resources."""
        if self.db_connection:
            self.db_connection.close()
            logging.info("🔒 Database connections closed")


def main():
    """Main entry point with command line interface."""
    parser = argparse.ArgumentParser(
        description="Medical Knowledge Graph System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --build                    # Build the knowledge graph
  python main.py --query                    # Start interactive query session
  python main.py --demo                     # Run demonstration queries
  python main.py --analyze                  # Analyze source data
  python main.py --build --demo             # Build graph and run demo
        """,
    )

    parser.add_argument(
        "--build",
        action="store_true",
        help="Build the knowledge graph from SQLite data",
    )

    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing graph data before building (use with --build)",
    )

    parser.add_argument(
        "--query", action="store_true", help="Start interactive query session"
    )

    parser.add_argument("--demo", action="store_true", help="Run demonstration queries")

    parser.add_argument(
        "--analyze", action="store_true", help="Analyze source SQLite database"
    )

    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Adjust logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Check for Neo4j availability
    if not NEO4J_AVAILABLE and (args.build or args.query or args.demo):
        print("❌ Neo4j driver not available. Please install with: pip install neo4j")
        sys.exit(1)

    # Initialize application
    try:
        app = MedicalKnowledgeGraphApp()

        # Execute requested operations
        if args.analyze:
            app.analyze_source_data()

        if args.build:
            success = app.build_knowledge_graph(clear_existing=args.clear)
            if not success:
                print("❌ Failed to build knowledge graph")
                sys.exit(1)

        if args.demo:
            app.run_demo_queries()

        if args.query:
            app.interactive_query_session()

        # Default action if no arguments provided
        if not any([args.build, args.query, args.demo, args.analyze]):
            print("\n🎯 Medical Knowledge Graph System")
            print("Use --help to see available options")
            print("\nQuick start:")
            print("  python main.py --build --demo")

    except KeyboardInterrupt:
        print("\n👋 Operation cancelled by user")
    except Exception as e:
        logging.error(f"❌ Application error: {e}")
        sys.exit(1)
    finally:
        try:
            app.close()
        except:
            pass


if __name__ == "__main__":
    main()
