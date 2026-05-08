#!/usr/bin/env python3
"""
RAG Query Interface for Medical Database

This script demonstrates how to query the medical database for RAG model implementation.
It provides various search functions optimized for different medical information retrieval patterns.

Usage:
    python rag_query_interface.py

Features:
- Symptom-based disease lookup
- Treatment and medication search
- Risk factor analysis
- Prevention method retrieval
- Universal text search for embedding generation
"""

import mysql.connector
from mysql.connector import Error
import sys
from typing import List, Dict, Optional


class MedicalRAGQuery:
    """RAG Query interface for medical database."""

    def __init__(self):
        """Initialize database connection."""
        self.connection = None
        self.connect_to_database()

    def connect_to_database(self):
        """Establish connection to MySQL database."""
        try:
            self.connection = mysql.connector.connect(
                host="localhost",
                port=3306,
                user="root",
                password="",
                database="medical_data",
            )
            print("✅ Connected to medical RAG database")
        except Error as e:
            print(f"❌ Error connecting to database: {e}")
            sys.exit(1)

    def search_by_symptoms(self, symptom_query: str) -> List[Dict]:
        """
        Search for diseases based on symptom description.

        Args:
            symptom_query: Description of symptoms to search for

        Returns:
            List of matching disease information
        """
        cursor = self.connection.cursor(dictionary=True)

        query = """
        SELECT disease_name, symptom_text, summary, source_url
        FROM rag_symptoms_search 
        WHERE symptom_text LIKE %s OR disease_name LIKE %s
        ORDER BY disease_name
        """

        search_term = f"%{symptom_query}%"
        cursor.execute(query, (search_term, search_term))
        results = cursor.fetchall()
        cursor.close()

        return results

    def search_treatments(
        self, disease_name: str = None, treatment_query: str = None
    ) -> List[Dict]:
        """
        Search for treatments and medications.

        Args:
            disease_name: Specific disease to search treatments for
            treatment_query: Treatment description to search for

        Returns:
            List of treatment information
        """
        cursor = self.connection.cursor(dictionary=True)

        if disease_name:
            query = """
            SELECT disease_name, treatment_text as treatment, information_type, summary
            FROM rag_treatment_search 
            WHERE disease_name LIKE %s
            ORDER BY information_type, disease_name
            """
            search_term = f"%{disease_name}%"
            cursor.execute(query, (search_term,))
        elif treatment_query:
            query = """
            SELECT disease_name, treatment_text as treatment, information_type, summary
            FROM rag_treatment_search 
            WHERE treatment_text LIKE %s
            ORDER BY disease_name
            """
            search_term = f"%{treatment_query}%"
            cursor.execute(query, (search_term,))
        else:
            query = """
            SELECT disease_name, treatment_text as treatment, information_type, summary
            FROM rag_treatment_search 
            ORDER BY disease_name, information_type
            """
            cursor.execute(query)

        results = cursor.fetchall()
        cursor.close()

        return results

    def search_diagnostic_tests(self, disease_name: str = None) -> List[Dict]:
        """
        Search for diagnostic tests and procedures.

        Args:
            disease_name: Disease to search diagnostic tests for

        Returns:
            List of diagnostic information
        """
        cursor = self.connection.cursor(dictionary=True)

        if disease_name:
            query = """
            SELECT disease_name, test_name as diagnostic_info, information_type, summary
            FROM rag_diagnostic_search 
            WHERE disease_name LIKE %s
            ORDER BY information_type, test_name
            """
            search_term = f"%{disease_name}%"
            cursor.execute(query, (search_term,))
        else:
            query = """
            SELECT disease_name, test_name as diagnostic_info, information_type, summary
            FROM rag_diagnostic_search 
            ORDER BY disease_name, information_type
            """
            cursor.execute(query)

        results = cursor.fetchall()
        cursor.close()

        return results

    def search_prevention_methods(self, disease_name: str = None) -> List[Dict]:
        """
        Search for disease prevention methods.

        Args:
            disease_name: Disease to search prevention for

        Returns:
            List of prevention information
        """
        cursor = self.connection.cursor(dictionary=True)

        if disease_name:
            query = """
            SELECT disease_name, prevention_text, summary, source_url
            FROM rag_prevention_search 
            WHERE disease_name LIKE %s
            ORDER BY disease_name
            """
            search_term = f"%{disease_name}%"
            cursor.execute(query, (search_term,))
        else:
            query = """
            SELECT disease_name, prevention_text, summary, source_url
            FROM rag_prevention_search 
            ORDER BY disease_name
            """
            cursor.execute(query)

        results = cursor.fetchall()
        cursor.close()

        return results

    def universal_search(self, query_text: str, limit: int = 10) -> List[Dict]:
        """
        Universal search across all medical information for RAG retrieval.

        Args:
            query_text: Text to search for across all medical data
            limit: Maximum number of results to return

        Returns:
            List of relevant medical information for RAG context
        """
        cursor = self.connection.cursor(dictionary=True)

        query = """
        SELECT disease_name, summary, information_type, search_text, source_url
        FROM rag_universal_search 
        WHERE search_text LIKE %s OR summary LIKE %s
        ORDER BY 
            CASE 
                WHEN search_text LIKE %s THEN 1
                WHEN summary LIKE %s THEN 2
                ELSE 3
            END,
            disease_name
        LIMIT %s
        """

        search_term = f"%{query_text}%"
        cursor.execute(
            query, (search_term, search_term, search_term, search_term, limit)
        )
        results = cursor.fetchall()
        cursor.close()

        return results

    def get_disease_complete_info(self, disease_name: str) -> Optional[Dict]:
        """
        Get complete information about a disease for comprehensive RAG context.

        Args:
            disease_name: Name of the disease

        Returns:
            Complete disease information or None if not found
        """
        cursor = self.connection.cursor(dictionary=True)

        query = """
        SELECT * FROM rag_disease_complete 
        WHERE disease_name LIKE %s
        """

        search_term = f"%{disease_name}%"
        cursor.execute(query, (search_term,))
        result = cursor.fetchone()
        cursor.close()

        return result

    def close_connection(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()


def display_results(results: List[Dict], title: str):
    """Display search results in a formatted way."""
    print(f"\n📋 {title}")
    print("=" * 60)

    if not results:
        print("No results found.")
        return

    for i, result in enumerate(results, 1):
        print(f"\n{i}. {result.get('disease_name', 'Unknown Disease')}")

        # Display different fields based on what's available
        for key, value in result.items():
            if key not in ["disease_name", "source_url"] and value:
                formatted_key = key.replace("_", " ").title()
                if len(str(value)) > 100:
                    print(f"   {formatted_key}: {str(value)[:100]}...")
                else:
                    print(f"   {formatted_key}: {value}")

        if "source_url" in result and result["source_url"]:
            print(f"   Source: {result['source_url']}")


def main():
    """Interactive demo of RAG query capabilities."""
    rag = MedicalRAGQuery()

    try:
        print("🏥 MEDICAL RAG QUERY INTERFACE")
        print("Demonstrating database queries for RAG model")
        print("=" * 60)

        while True:
            print(f"\nAvailable commands:")
            print("1. Search by symptoms")
            print("2. Search treatments")
            print("3. Search diagnostic tests")
            print("4. Search prevention methods")
            print("5. Universal search")
            print("6. Get complete disease info")
            print("7. Exit")

            choice = input("\nEnter your choice (1-7): ").strip()

            if choice == "1":
                symptom = input("Enter symptom to search for: ").strip()
                results = rag.search_by_symptoms(symptom)
                display_results(results, f"Diseases with symptoms matching '{symptom}'")

            elif choice == "2":
                disease = input("Enter disease name (or press Enter for all): ").strip()
                if disease:
                    results = rag.search_treatments(disease_name=disease)
                else:
                    results = rag.search_treatments()
                display_results(results, "Treatment Information")

            elif choice == "3":
                disease = input("Enter disease name (or press Enter for all): ").strip()
                if disease:
                    results = rag.search_diagnostic_tests(disease_name=disease)
                else:
                    results = rag.search_diagnostic_tests()
                display_results(results, "Diagnostic Tests and Procedures")

            elif choice == "4":
                disease = input("Enter disease name (or press Enter for all): ").strip()
                if disease:
                    results = rag.search_prevention_methods(disease_name=disease)
                else:
                    results = rag.search_prevention_methods()
                display_results(results, "Prevention Methods")

            elif choice == "5":
                query = input("Enter search query: ").strip()
                results = rag.universal_search(query)
                display_results(results, f"Universal search results for '{query}'")

            elif choice == "6":
                disease = input("Enter disease name: ").strip()
                result = rag.get_disease_complete_info(disease)
                if result:
                    display_results([result], f"Complete information for '{disease}'")
                else:
                    print(f"No information found for '{disease}'")

            elif choice == "7":
                print("Goodbye! 👋")
                break

            else:
                print("Invalid choice. Please try again.")

    finally:
        rag.close_connection()


if __name__ == "__main__":
    main()
