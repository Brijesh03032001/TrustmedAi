#!/usr/bin/env python3
"""
RAG Database Ingestion Script

This script loads symptoms and diagnosis JSON data into MySQL database
optimized for Retrieval-Augmented Generation (RAG) model implementation.

Features:
- Loads both symptoms.json and diagnosis.json
- Creates vector-friendly text embeddings structure
- Handles relationships between diseases and their attributes
- Optimized for RAG retrieval patterns

Requirements:
- MySQL server running
- pymysql package: pip install pymysql
"""

import json
import mysql.connector
from mysql.connector import Error
import sys
from datetime import datetime


def create_database_connection():
    """
    Create connection to MySQL database.

    Returns:
        mysql.connector connection object
    """
    try:
        connection = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="",  # No password for root user (default Homebrew MySQL setup)
            database="medical_data",
        )
        print("✅ Successfully connected to MySQL database")
        return connection
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        sys.exit(1)


def load_json_file(filepath):
    """Load and parse JSON file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON file {filepath}: {e}")
        return None


def insert_disease_record(cursor, disease_name, source_url, summary, content_type):
    """
    Insert or update disease record and return disease_id.

    Args:
        cursor: MySQL cursor object
        disease_name: Name of the disease
        source_url: Source URL for the data
        summary: Disease summary text
        content_type: 'symptoms' or 'diagnosis'

    Returns:
        int: disease_id
    """
    insert_query = """
    INSERT INTO diseases (disease_name, source_url, summary, content_type)
    VALUES (%s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        source_url = VALUES(source_url),
        summary = VALUES(summary),
        updated_at = CURRENT_TIMESTAMP
    """

    cursor.execute(insert_query, (disease_name, source_url, summary, content_type))

    # Get the disease_id
    select_query = """
    SELECT id FROM diseases 
    WHERE disease_name = %s AND content_type = %s
    """
    cursor.execute(select_query, (disease_name, content_type))
    result = cursor.fetchone()

    return result[0] if result else None


def insert_symptoms_data(cursor, disease_id, symptoms_list):
    """Insert symptoms data for a disease."""
    if not symptoms_list:
        return

    # Clear existing symptoms for this disease
    cursor.execute("DELETE FROM symptoms WHERE disease_id = %s", (disease_id,))

    # Insert new symptoms
    insert_query = "INSERT INTO symptoms (disease_id, symptom_text) VALUES (%s, %s)"
    for symptom in symptoms_list:
        cursor.execute(insert_query, (disease_id, symptom))


def insert_causes_data(cursor, disease_id, causes_list):
    """Insert causes data for a disease."""
    if not causes_list:
        return

    # Clear existing causes for this disease
    cursor.execute("DELETE FROM causes WHERE disease_id = %s", (disease_id,))

    # Insert new causes
    insert_query = "INSERT INTO causes (disease_id, cause_text) VALUES (%s, %s)"
    for cause in causes_list:
        cursor.execute(insert_query, (disease_id, cause))


def insert_prevention_data(cursor, disease_id, prevention_list):
    """Insert prevention data for a disease."""
    if not prevention_list:
        return

    # Clear existing prevention for this disease
    cursor.execute("DELETE FROM prevention WHERE disease_id = %s", (disease_id,))

    # Insert new prevention methods
    insert_query = (
        "INSERT INTO prevention (disease_id, prevention_text) VALUES (%s, %s)"
    )
    for prevention in prevention_list:
        cursor.execute(insert_query, (disease_id, prevention))


def insert_diagnosis_data(cursor, disease_id, analysis):
    """Insert diagnosis-specific data (tests, treatments, medications, procedures)."""

    # Diagnostic tests
    if "diagnostic_tests" in analysis:
        cursor.execute(
            "DELETE FROM diagnostic_tests WHERE disease_id = %s", (disease_id,)
        )
        insert_query = (
            "INSERT INTO diagnostic_tests (disease_id, test_name) VALUES (%s, %s)"
        )
        for test in analysis["diagnostic_tests"]:
            cursor.execute(insert_query, (disease_id, test))

    # Treatments
    if "treatment_options" in analysis:
        cursor.execute("DELETE FROM treatments WHERE disease_id = %s", (disease_id,))
        insert_query = (
            "INSERT INTO treatments (disease_id, treatment_text) VALUES (%s, %s)"
        )
        for treatment in analysis["treatment_options"]:
            cursor.execute(insert_query, (disease_id, treatment))

    # Medications
    if "medications" in analysis:
        cursor.execute("DELETE FROM medications WHERE disease_id = %s", (disease_id,))
        insert_query = (
            "INSERT INTO medications (disease_id, medication_name) VALUES (%s, %s)"
        )
        for medication in analysis["medications"]:
            cursor.execute(insert_query, (disease_id, medication))

    # Procedures
    if "procedures" in analysis:
        cursor.execute("DELETE FROM procedures WHERE disease_id = %s", (disease_id,))
        insert_query = (
            "INSERT INTO procedures (disease_id, procedure_name) VALUES (%s, %s)"
        )
        for procedure in analysis["procedures"]:
            cursor.execute(insert_query, (disease_id, procedure))


def process_symptoms_json(connection, filepath):
    """Process symptoms.json file and insert data into database."""
    print(f"\n🔄 Processing symptoms data from {filepath}")

    data = load_json_file(filepath)
    if not data:
        return False

    cursor = connection.cursor()
    processed_count = 0

    try:
        for disease_entry in data.get("diseases", []):
            disease_name = disease_entry.get("disease_name")
            source_url = disease_entry.get("source_url")
            analysis = disease_entry.get("analysis", {})
            summary = analysis.get("summary", "")

            print(f"  📋 Processing: {disease_name}")

            # Insert disease record
            disease_id = insert_disease_record(
                cursor, disease_name, source_url, summary, "symptoms"
            )

            if disease_id:
                # Insert symptoms, causes, and prevention data
                insert_symptoms_data(cursor, disease_id, analysis.get("symptoms", []))
                insert_causes_data(cursor, disease_id, analysis.get("causes", []))
                insert_prevention_data(
                    cursor, disease_id, analysis.get("prevention", [])
                )

                processed_count += 1
                print(f"    ✅ Inserted symptoms data for {disease_name}")

        connection.commit()
        print(
            f"✅ Successfully processed {processed_count} diseases from symptoms data"
        )
        return True

    except Error as e:
        print(f"❌ Error processing symptoms data: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()


def process_diagnosis_json(connection, filepath):
    """Process diagnosis.json file and insert data into database."""
    print(f"\n🔄 Processing diagnosis data from {filepath}")

    data = load_json_file(filepath)
    if not data:
        return False

    cursor = connection.cursor()
    processed_count = 0

    try:
        for disease_entry in data.get("diseases", []):
            disease_name = disease_entry.get("disease_name")
            source_url = disease_entry.get("source_url")
            analysis = disease_entry.get("analysis", {})
            summary = analysis.get("summary", "")

            print(f"  📋 Processing: {disease_name}")

            # Insert disease record
            disease_id = insert_disease_record(
                cursor, disease_name, source_url, summary, "diagnosis"
            )

            if disease_id:
                # Insert diagnosis-specific data
                insert_diagnosis_data(cursor, disease_id, analysis)

                processed_count += 1
                print(f"    ✅ Inserted diagnosis data for {disease_name}")

        connection.commit()
        print(
            f"✅ Successfully processed {processed_count} diseases from diagnosis data"
        )
        return True

    except Error as e:
        print(f"❌ Error processing diagnosis data: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()


def display_database_stats(connection):
    """Display statistics about the populated database."""
    print(f"\n📊 DATABASE STATISTICS")
    print("=" * 50)

    cursor = connection.cursor()

    # Count diseases by type
    cursor.execute("SELECT content_type, COUNT(*) FROM diseases GROUP BY content_type")
    disease_counts = cursor.fetchall()

    for content_type, count in disease_counts:
        print(f"Diseases ({content_type}): {count}")

    # Count total records in each table
    tables = [
        "symptoms",
        "causes",
        "prevention",
        "diagnostic_tests",
        "treatments",
        "medications",
        "procedures",
    ]

    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"Total {table}: {count}")

    cursor.close()


def main():
    """Main function to orchestrate RAG database ingestion."""
    print("🚀 RAG DATABASE INGESTION")
    print("Loading medical data for Retrieval-Augmented Generation")
    print("=" * 60)

    # Connect to database
    connection = create_database_connection()

    try:
        # Process symptoms data
        symptoms_success = process_symptoms_json(
            connection, "consolidated_results/symptoms.json"
        )

        # Process diagnosis data
        diagnosis_success = process_diagnosis_json(
            connection, "consolidated_results/diagnosis.json"
        )

        if symptoms_success and diagnosis_success:
            print(f"\n🎉 RAG DATABASE INGESTION COMPLETED SUCCESSFULLY!")
            display_database_stats(connection)

            print(f"\n💡 Your RAG model can now query:")
            print("  - Symptoms data for disease symptom retrieval")
            print("  - Causes data for risk factor analysis")
            print("  - Prevention data for preventive measures")
            print("  - Diagnostic tests for clinical decision support")
            print(
                "  - Treatments, medications, and procedures for care recommendations"
            )

        else:
            print(f"\n❌ Some errors occurred during ingestion")

    finally:
        connection.close()


if __name__ == "__main__":
    main()
