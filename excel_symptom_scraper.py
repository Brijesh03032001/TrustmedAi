#!/usr/bin/env python3
"""
Excel-based Mayo Clinic Scraper for Symptom URLs

This script reads the mayoclinic_urls.xlsx file, extracts URLs where type = "symptoms",
and scrapes them to populate the symptom table in the database.

Usage:
    python excel_symptom_scraper.py
"""

import pandas as pd
import mysql.connector
from mysql.connector import Error
import sys
import time
from mayo_clinic_section_scraper import MayoClinicSectionScraper


class ExcelSymptomScraper:
    """Scraper that processes symptom URLs from Excel file."""

    def __init__(self, excel_file="mayoclinic_urls.xlsx"):
        """Initialize with Excel file path."""
        self.excel_file = excel_file
        self.scraper = MayoClinicSectionScraper()

    def read_excel_file(self):
        """Read the Excel file and extract symptom URLs."""
        try:
            print(f"📊 Reading Excel file: {self.excel_file}")

            # Read the Excel file
            df = pd.read_excel(self.excel_file)

            # Display basic info about the file
            print(f"✅ Successfully loaded Excel file")
            print(f"   Total rows: {len(df)}")
            print(f"   Columns: {list(df.columns)}")

            # Check unique types
            if "type" in df.columns:
                unique_types = df["type"].unique()
                print(f"   Unique types: {list(unique_types)}")

                # Count by type
                type_counts = df["type"].value_counts()
                for type_name, count in type_counts.items():
                    print(f"   - {type_name}: {count} URLs")

            return df

        except FileNotFoundError:
            print(f"❌ Excel file not found: {self.excel_file}")
            return None
        except Exception as e:
            print(f"❌ Error reading Excel file: {e}")
            return None

    def extract_symptom_urls(self, df):
        """Extract URLs where type = 'symptoms'."""
        try:
            # Filter for symptom URLs
            symptom_df = df[df["type"] == "symptoms"].copy()

            print(f"\n🔍 Filtering for symptom URLs:")
            print(f"   Found {len(symptom_df)} symptom URLs")

            if len(symptom_df) == 0:
                print("❌ No symptom URLs found in the Excel file")
                return []

            # Display sample URLs
            print(f"\n📋 Sample symptom URLs:")
            for i, row in symptom_df.head(5).iterrows():
                disease = row.get("disease_name", "Unknown")
                url = row.get("url", "No URL")
                print(f"   {i + 1}. {disease}: {url}")

            if len(symptom_df) > 5:
                print(f"   ... and {len(symptom_df) - 5} more URLs")

            # Return list of URLs
            return symptom_df["url"].tolist()

        except Exception as e:
            print(f"❌ Error filtering symptom URLs: {e}")
            return []

    def clear_symptom_table(self):
        """Clear the existing symptom table data."""
        try:
            print(f"\n🗑️ Clearing symptom table...")

            cursor = self.scraper.connection.cursor()
            cursor.execute("DELETE FROM symptom")
            self.scraper.connection.commit()
            cursor.close()

            print(f"✅ Symptom table cleared")
            return True

        except Error as e:
            print(f"❌ Error clearing symptom table: {e}")
            return False

    def scrape_symptom_urls(self, urls):
        """Scrape all symptom URLs and insert into database."""
        if not urls:
            print("❌ No URLs to scrape")
            return

        print(f"\n🚀 Starting to scrape {len(urls)} symptom URLs")
        print("=" * 70)

        successful = 0
        failed = 0

        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processing URL...")

            try:
                # Extract sections from the page
                data = self.scraper.scrape_page_sections(url)

                if data:
                    # Insert into database
                    if self.scraper.insert_into_database(data):
                        successful += 1
                    else:
                        failed += 1
                        print(
                            f"❌ Failed to insert data for {data.get('disease_name', 'Unknown')}"
                        )
                else:
                    failed += 1
                    print(f"❌ Failed to scrape data from {url}")

                # Add delay between requests to be respectful
                if i < len(urls):
                    time.sleep(2)

            except Exception as e:
                print(f"❌ Exception processing {url}: {e}")
                failed += 1

        # Display summary
        print(f"\n📊 SCRAPING SUMMARY")
        print("=" * 40)
        print(f"Total URLs: {len(urls)}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(successful / len(urls) * 100):.1f}%")

        return successful, failed

    def display_final_stats(self):
        """Display final database statistics."""
        try:
            cursor = self.scraper.connection.cursor()

            # Count total records
            cursor.execute("SELECT COUNT(*) FROM symptom")
            total_count = cursor.fetchone()[0]

            # Get disease names
            cursor.execute("SELECT disease_name FROM symptom ORDER BY disease_name")
            diseases = [row[0] for row in cursor.fetchall()]

            cursor.close()

            print(f"\n📋 FINAL DATABASE STATS")
            print("=" * 40)
            print(f"Total records in symptom table: {total_count}")

            if diseases:
                print(f"\nDiseases in database:")
                for i, disease in enumerate(diseases, 1):
                    print(f"  {i}. {disease}")

        except Error as e:
            print(f"❌ Error getting database stats: {e}")

    def run(self):
        """Main execution method."""
        print("🏥 EXCEL-BASED SYMPTOM SCRAPER")
        print("Reading URLs from mayoclinic_urls.xlsx and populating symptom table")
        print("=" * 80)

        try:
            # Step 1: Read Excel file
            df = self.read_excel_file()
            if df is None:
                return

            # Step 2: Extract symptom URLs
            symptom_urls = self.extract_symptom_urls(df)
            if not symptom_urls:
                return

            # Step 3: Confirm with user (in actual run, this would be interactive)
            print(f"\n⚠️ This will:")
            print(f"   1. Clear all existing data in the symptom table")
            print(f"   2. Scrape {len(symptom_urls)} symptom URLs")
            print(f"   3. Insert new data into the symptom table")

            # For automation, we'll proceed. In interactive mode, you'd ask for confirmation.
            proceed = True

            if not proceed:
                print("Operation cancelled by user.")
                return

            # Step 4: Clear existing data
            if not self.clear_symptom_table():
                return

            # Step 5: Scrape URLs and populate database
            successful, failed = self.scrape_symptom_urls(symptom_urls)

            # Step 6: Display final statistics
            self.display_final_stats()

            if successful > 0:
                print(
                    f"\n🎉 SUCCESS! Scraped and stored {successful} pages from Excel file."
                )
                print("Your symptom table is now populated with fresh data!")
            else:
                print(f"\n❌ No pages were successfully scraped.")

        except Exception as e:
            print(f"❌ Unexpected error: {e}")

        finally:
            # Clean up
            self.scraper.close_connection()


def main():
    """Main function."""
    # Check if required packages are available
    try:
        import pandas as pd
        import openpyxl  # Required for reading Excel files
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Please install with: pip install pandas openpyxl")
        return

    # Run the scraper
    scraper = ExcelSymptomScraper()
    scraper.run()


if __name__ == "__main__":
    main()
