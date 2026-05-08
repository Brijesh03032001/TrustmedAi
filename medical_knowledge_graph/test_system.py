"""
Test the basic functionality of the Medical Knowledge Graph System
"""

import sys
from pathlib import Path
import sqlite3

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))


def test_sqlite_database_exists():
    """Test that the SQLite database exists and has data."""
    # Check both possible locations
    db_paths = [
        project_root / "data" / "medical_symptoms.db",
        Path(__file__).parent / "data" / "medical_symptoms.db",
    ]

    db_path = None
    for path in db_paths:
        if path.exists():
            db_path = path
            break

    if not db_path:
        print(f"❌ Database not found at any of: {[str(p) for p in db_paths]}")
        return False

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Check if medical_conditions table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='medical_conditions'
        """)

        if not cursor.fetchone():
            print("❌ medical_conditions table not found")
            return False

        # Get row count
        cursor.execute("SELECT COUNT(*) FROM medical_conditions")
        count = cursor.fetchone()[0]

        print(f"✅ Database found with {count} medical conditions")

        # Show sample data
        cursor.execute(
            "SELECT condition_name, symptoms FROM medical_conditions LIMIT 3"
        )
        samples = cursor.fetchall()

        print("📋 Sample conditions:")
        for name, symptoms in samples:
            print(f"  • {name}: {symptoms[:100]}...")

        conn.close()
        return True

    except Exception as e:
        print(f"❌ Database error: {e}")
        return False


def test_configuration():
    """Test that configuration can be loaded."""
    try:
        from config.settings import settings

        print("✅ Configuration loaded successfully")
        print(f"   • Neo4j URI: {settings.neo4j.uri}")
        print(f"   • Batch size: {settings.data.batch_size}")
        print(f"   • Project root: {settings.project_root}")

        return True

    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False


def test_data_processor():
    """Test basic data processing functionality."""
    try:
        sys.path.append(str(project_root / "src"))
        from data_processor import MedicalDataExtractor, TextProcessor

        # Test text processor
        processor = TextProcessor()

        # Test text cleaning
        sample_text = "Patient has severe headache and fever!!!"
        clean_text = processor.clean_text(sample_text)
        print(f"✅ Text processing: '{sample_text}' → '{clean_text}'")

        # Test entity extraction
        entities = processor.extract_medical_entities(clean_text)
        print(f"✅ Entity extraction: {entities}")

        # Test data extractor initialization
        db_path = project_root / "data" / "medical_symptoms.db"
        extractor = MedicalDataExtractor(str(db_path))

        print("✅ Data processor initialized successfully")
        return True

    except Exception as e:
        print(f"❌ Data processor error: {e}")
        return False


def test_project_structure():
    """Test that project structure is correct."""
    required_files = [
        "main.py",
        "config/settings.py",
        "src/database.py",
        "src/data_processor.py",
        "src/graph_builder.py",
        "src/query_engine.py",
        "requirements.txt",
        "README.md",
    ]

    missing_files = []

    for file_path in required_files:
        full_path = project_root / file_path
        if not full_path.exists():
            missing_files.append(file_path)

    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False

    print("✅ Project structure is complete")
    return True


def main():
    """Run all tests."""
    print("🧪 Testing Medical Knowledge Graph System")
    print("=" * 50)

    tests = [
        ("Project Structure", test_project_structure),
        ("SQLite Database", test_sqlite_database_exists),
        ("Configuration", test_configuration),
        ("Data Processor", test_data_processor),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}:")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} failed with error: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)

    passed = 0
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if success:
            passed += 1

    print(f"\nResults: {passed}/{len(results)} tests passed")

    if passed == len(results):
        print("\n🎉 All tests passed! System is ready.")
        print("\nNext steps:")
        print(
            "1. Install Neo4j: docker run --name neo4j -p7474:7474 -p7687:7687 -d --env NEO4J_AUTH=neo4j/password neo4j:latest"
        )
        print(
            "2. Install dependencies: pip install neo4j pandas spacy sentence-transformers"
        )
        print("3. Build graph: python main.py --build")
        print("4. Run demo: python main.py --demo")
    else:
        print(
            f"\n⚠️  {len(results) - passed} tests failed. Please check the issues above."
        )


if __name__ == "__main__":
    main()
