"""
Simple Neo4j Connection Test
"""


def test_neo4j_connection():
    """Test connection to Neo4j database."""
    try:
        from neo4j import GraphDatabase

        # Connect to Neo4j
        driver = GraphDatabase.driver(
            "bolt://localhost:7687", auth=("neo4j", "password")
        )

        # Test connection
        with driver.session() as session:
            result = session.run("RETURN 1 as test")
            test_value = result.single()["test"]

            if test_value == 1:
                print("✅ Neo4j connection successful!")

                # Get Neo4j version
                result = session.run(
                    "CALL dbms.components() YIELD name, versions, edition"
                )
                for record in result:
                    print(
                        f"   📊 {record['name']}: {record['versions'][0]} ({record['edition']})"
                    )

                # Test basic operations
                session.run("CREATE (n:Test {message: 'Hello Neo4j!'}) RETURN n")
                result = session.run("MATCH (n:Test) RETURN n.message as message")
                message = result.single()["message"]
                print(f"   💬 Test message: {message}")

                # Clean up
                session.run("MATCH (n:Test) DELETE n")

                driver.close()
                return True
            else:
                print("❌ Neo4j connection test failed")
                return False

    except ImportError:
        print("❌ Neo4j driver not installed. Run: pip install neo4j")
        return False
    except Exception as e:
        print(f"❌ Neo4j connection failed: {e}")
        return False


def test_database_file():
    """Test that our medical database exists."""
    import sqlite3
    from pathlib import Path

    db_path = Path("data/medical_symptoms.db")

    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return False

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Check table
        cursor.execute("SELECT COUNT(*) FROM symptom")
        count = cursor.fetchone()[0]

        print(f"✅ Medical database found with {count:,} conditions")

        # Show sample
        cursor.execute("SELECT disease_name FROM symptom LIMIT 3")
        samples = [row[0] for row in cursor.fetchall()]
        print(f"   📋 Sample conditions: {', '.join(samples)}")

        conn.close()
        return True

    except Exception as e:
        print(f"❌ Database error: {e}")
        return False


def main():
    print("🚀 Medical Knowledge Graph - Neo4j Setup Verification")
    print("=" * 60)

    tests = [
        ("Medical Database", test_database_file),
        ("Neo4j Connection", test_neo4j_connection),
    ]

    all_passed = True

    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}:")
        try:
            success = test_func()
            if not success:
                all_passed = False
        except Exception as e:
            print(f"❌ {test_name} failed: {e}")
            all_passed = False

    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All tests passed! Your system is ready!")
        print("\nNext steps:")
        print(
            "1. Install additional dependencies: pip install spacy sentence-transformers scikit-learn"
        )
        print("2. Download spaCy model: python -m spacy download en_core_web_sm")
        print("3. Build knowledge graph: python main.py --build")
        print("4. Access Neo4j Browser: http://localhost:7474")
        print("   Username: neo4j")
        print("   Password: password")
    else:
        print("❌ Some tests failed. Please check the issues above.")


if __name__ == "__main__":
    main()
