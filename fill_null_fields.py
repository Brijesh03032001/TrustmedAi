#!/usr/bin/env python3
"""
AI-Powered NULL Field Filler

This script finds records with NULL values in the symptom table and uses
AI (Ollama LLaMA model) to generate appropriate medical content for missing fields.

Usage:
    python fill_null_fields.py
"""

import mysql.connector
from mysql.connector import Error
import requests
import json
import time
import sys


class NullFieldFiller:
    """AI-powered filler for NULL database fields."""

    def __init__(self):
        """Initialize with database connection and AI model."""
        self.connection = self.connect_to_database()
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model_name = "llama3.2"

        # Field-specific prompts for generating medical content
        self.prompts = {
            "overview": """You are a medical expert. Provide a brief, factual overview of the medical condition "{disease}". 
Write 2-3 sentences covering what it is, who it affects, and its general characteristics. 
Keep it professional and informative. Do not include symptoms, causes, or complications - just the basic definition and overview.""",
            "symptoms": """You are a medical expert. List the main symptoms and signs of the medical condition "{disease}". 
Provide 3-5 key symptoms that patients typically experience. 
Format as a clear, concise paragraph mentioning the most common and characteristic symptoms. 
Be specific and medically accurate.""",
            "causes": """You are a medical expert. Explain the main causes and underlying mechanisms of the medical condition "{disease}". 
Describe what leads to this condition, including biological, genetic, environmental, or lifestyle factors. 
Write 2-3 sentences focusing on the primary causative factors. Be factual and medically accurate.""",
            "risk_factors": """You are a medical expert. List the main risk factors that increase someone's likelihood of developing "{disease}". 
Include demographic factors (age, gender), lifestyle factors, medical conditions, or genetic predispositions. 
Write 2-3 sentences covering the most significant risk factors. Be concise and medically accurate.""",
            "complications": """You are a medical expert. Describe the potential complications that can arise from the medical condition "{disease}". 
Explain what serious outcomes or secondary conditions might develop if the condition is untreated or poorly managed. 
Write 2-3 sentences focusing on the most significant complications. Be factual and medically accurate.""",
        }

    def connect_to_database(self):
        """Connect to MySQL database."""
        try:
            connection = mysql.connector.connect(
                host="localhost", user="root", database="medical_data"
            )
            print("✅ Connected to MySQL database")
            return connection
        except Error as e:
            print(f"❌ Database connection error: {e}")
            sys.exit(1)

    def check_ollama_connection(self):
        """Check if Ollama is running and accessible."""
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json()
                available_models = [model["name"] for model in models.get("models", [])]
                print(f"✅ Ollama is running. Available models: {available_models}")

                if self.model_name not in available_models:
                    print(
                        f"⚠️ Model {self.model_name} not found. Using first available model."
                    )
                    if available_models:
                        self.model_name = available_models[0]
                        print(f"   Switched to: {self.model_name}")
                    else:
                        print("❌ No models available in Ollama")
                        return False

                return True
        except Exception as e:
            print(f"❌ Ollama connection failed: {e}")
            return False

    def generate_content(self, disease_name, field_type):
        """Generate content for a specific field using AI."""
        try:
            prompt = self.prompts[field_type].format(disease=disease_name)

            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.3, "top_p": 0.9, "max_tokens": 200},
            }

            response = requests.post(self.ollama_url, json=payload, timeout=30)

            if response.status_code == 200:
                result = response.json()
                content = result.get("response", "").strip()

                # Clean up the content
                content = content.replace("\n", " ").replace("\r", " ")
                content = " ".join(content.split())  # Remove extra spaces

                return content if content else None
            else:
                print(f"❌ Ollama API error: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Content generation error: {e}")
            return None

    def find_records_with_nulls(self):
        """Find all records that have NULL values in any field."""
        try:
            cursor = self.connection.cursor()

            query = """
                SELECT id, disease_name,
                       CASE WHEN overview IS NULL OR overview = '' THEN 1 ELSE 0 END as need_overview,
                       CASE WHEN symptoms IS NULL OR symptoms = '' THEN 1 ELSE 0 END as need_symptoms,
                       CASE WHEN causes IS NULL OR causes = '' THEN 1 ELSE 0 END as need_causes,
                       CASE WHEN risk_factors IS NULL OR risk_factors = '' THEN 1 ELSE 0 END as need_risk_factors,
                       CASE WHEN complications IS NULL OR complications = '' THEN 1 ELSE 0 END as need_complications
                FROM symptom 
                WHERE (overview IS NULL OR overview = '') OR 
                      (symptoms IS NULL OR symptoms = '') OR 
                      (causes IS NULL OR causes = '') OR 
                      (risk_factors IS NULL OR risk_factors = '') OR 
                      (complications IS NULL OR complications = '')
                ORDER BY id
            """

            cursor.execute(query)
            records = cursor.fetchall()
            cursor.close()

            return records

        except Error as e:
            print(f"❌ Error finding NULL records: {e}")
            return []

    def update_field(self, record_id, field_name, content):
        """Update a specific field in the database."""
        try:
            cursor = self.connection.cursor()

            query = f"UPDATE symptom SET {field_name} = %s WHERE id = %s"
            cursor.execute(query, (content, record_id))
            self.connection.commit()
            cursor.close()

            return True

        except Error as e:
            print(f"❌ Error updating field {field_name} for ID {record_id}: {e}")
            return False

    def process_records(self, limit=None):
        """Process records with NULL values and fill them using AI."""
        print("🔍 Finding records with NULL values...")

        records = self.find_records_with_nulls()
        if not records:
            print("✅ No records with NULL values found!")
            return

        total_records = len(records)
        if limit:
            records = records[:limit]
            print(
                f"📝 Processing {len(records)} out of {total_records} records (limited)"
            )
        else:
            print(f"📝 Found {total_records} records with NULL values")

        print("=" * 80)

        fields = ["overview", "symptoms", "causes", "risk_factors", "complications"]
        successful_updates = 0
        failed_updates = 0

        for i, record in enumerate(records, 1):
            record_id, disease_name = record[0], record[1]
            null_flags = record[2:7]  # need_overview, need_symptoms, etc.

            print(
                f"\n[{i}/{len(records)}] Processing: {disease_name} (ID: {record_id})"
            )

            # Process each field that needs content
            for j, field in enumerate(fields):
                if null_flags[j] == 1:  # Field needs content
                    print(f"   Generating {field}...")

                    content = self.generate_content(disease_name, field)
                    if content:
                        if self.update_field(record_id, field, content):
                            print(f"   ✅ Updated {field}: {content[:80]}...")
                            successful_updates += 1
                        else:
                            print(f"   ❌ Failed to update {field}")
                            failed_updates += 1
                    else:
                        print(f"   ❌ Failed to generate content for {field}")
                        failed_updates += 1

                    # Add delay between API calls to be respectful
                    time.sleep(1)

        # Display summary
        print(f"\n📊 PROCESSING SUMMARY")
        print("=" * 40)
        print(f"Records processed: {len(records)}")
        print(f"Successful updates: {successful_updates}")
        print(f"Failed updates: {failed_updates}")

        if successful_updates > 0:
            success_rate = (
                successful_updates / (successful_updates + failed_updates)
            ) * 100
            print(f"Success rate: {success_rate:.1f}%")

    def display_sample_results(self):
        """Display sample results after processing."""
        try:
            cursor = self.connection.cursor()

            cursor.execute("""
                SELECT id, disease_name, 
                       CASE WHEN overview IS NULL OR overview = '' THEN 'NULL' ELSE 'FILLED' END as overview_status,
                       CASE WHEN symptoms IS NULL OR symptoms = '' THEN 'NULL' ELSE 'FILLED' END as symptoms_status,
                       CASE WHEN causes IS NULL OR causes = '' THEN 'NULL' ELSE 'FILLED' END as causes_status,
                       CASE WHEN risk_factors IS NULL OR risk_factors = '' THEN 'NULL' ELSE 'FILLED' END as risk_factors_status,
                       CASE WHEN complications IS NULL OR complications = '' THEN 'NULL' ELSE 'FILLED' END as complications_status
                FROM symptom 
                WHERE id IN (2, 4, 8, 10, 12)  -- Sample IDs we saw earlier
                ORDER BY id
            """)

            records = cursor.fetchall()

            print(f"\n📋 SAMPLE RESULTS:")
            print(
                "ID   Disease Name                    Overview Symptoms Causes Risk_Factors Complications"
            )
            print("-" * 80)

            for record in records:
                print(
                    f"{record[0]:3d}. {record[1][:25]:25s} {record[2]:8s} {record[3]:8s} {record[4]:6s} {record[5]:12s} {record[6]:13s}"
                )

            cursor.close()

        except Error as e:
            print(f"❌ Error displaying results: {e}")

    def run(self, limit=10):
        """Main execution method."""
        print("🤖 AI-POWERED NULL FIELD FILLER")
        print("Using Ollama LLaMA model to generate missing medical content")
        print("=" * 80)

        # Check Ollama connection
        if not self.check_ollama_connection():
            print("❌ Cannot proceed without Ollama. Please start Ollama service.")
            return

        try:
            # Process records with NULL values
            self.process_records(limit=limit)

            # Display sample results
            self.display_sample_results()

        except KeyboardInterrupt:
            print("\n⚠️ Process interrupted by user")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        finally:
            # Clean up
            if self.connection:
                self.connection.close()
                print("\n🔌 Database connection closed")


def main():
    """Main function."""
    # Check if user wants to limit processing
    import sys

    limit = 10  # Default limit for testing
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except ValueError:
            print("Usage: python fill_null_fields.py [limit]")
            return

    if limit:
        print(f"⚠️ Processing limited to {limit} records for testing")
        print("To process all records, use: python fill_null_fields.py 0")
        print()

    filler = NullFieldFiller()
    filler.run(limit=limit if limit > 0 else None)


if __name__ == "__main__":
    main()
