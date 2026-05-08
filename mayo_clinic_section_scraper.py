#!/usr/bin/env python3
"""
Mayo Clinic Section-Based Scraper for Symptom Table

This script scrapes specific sections (Overview, Symptoms, Causes, Risk factors, Complications)
from Mayo Clinic pages and inserts them into the symptom table.

Usage:
    python mayo_clinic_section_scraper.py
"""

import requests
from bs4 import BeautifulSoup
import mysql.connector
from mysql.connector import Error
import re
import time
from urllib.parse import urlparse
import sys


class MayoClinicSectionScraper:
    """Scraper for extracting specific sections from Mayo Clinic pages."""

    def __init__(self):
        """Initialize the scraper and database connection."""
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
        )
        self.connection = self.connect_to_database()

    def connect_to_database(self):
        """Connect to MySQL database."""
        try:
            connection = mysql.connector.connect(
                host="localhost",
                port=3306,
                user="root",
                password="",
                database="medical_data",
            )
            print("✅ Connected to MySQL database")
            return connection
        except Error as e:
            print(f"❌ Database connection error: {e}")
            sys.exit(1)

    def extract_disease_name_from_url(self, url):
        """Extract disease name from Mayo Clinic URL."""
        match = re.search(r"/diseases-conditions/([^/]+)/", url)
        if match:
            return match.group(1).replace("-", " ").title()
        return "Unknown Disease"

    def clean_text(self, text):
        """Clean and normalize text content."""
        if not text:
            return ""

        # Remove extra whitespace and newlines
        text = re.sub(r"\s+", " ", text.strip())
        # Remove special characters that might cause issues
        text = re.sub(r"[^\w\s\.,;:()/-]", "", text)
        return text

    def extract_section_content(self, soup, section_headers):
        """
        Extract content from a specific section based on header text.

        Args:
            soup: BeautifulSoup object
            section_headers: List of possible header texts to look for

        Returns:
            Extracted text content or empty string
        """
        content_parts = []

        # Look for section headers
        for header_text in section_headers:
            # Find headers (h2, h3, h4) that contain the section text
            headers = soup.find_all(
                ["h2", "h3", "h4"], string=re.compile(header_text, re.IGNORECASE)
            )

            if not headers:
                # Try finding headers with text containing the section
                headers = soup.find_all(["h2", "h3", "h4"])
                headers = [
                    h
                    for h in headers
                    if h.get_text() and header_text.lower() in h.get_text().lower()
                ]

            for header in headers:
                # Extract content after the header until next header or section
                current = header.find_next_sibling()
                section_content = []

                while current:
                    # Stop if we hit another header of same or higher level
                    if current.name in ["h1", "h2", "h3", "h4"]:
                        break

                    # Extract text from paragraphs, lists, etc.
                    if current.name in ["p", "ul", "ol", "li", "div"]:
                        text = current.get_text().strip()
                        if text and len(text) > 10:  # Filter out very short text
                            section_content.append(text)

                    current = current.find_next_sibling()

                if section_content:
                    content_parts.extend(section_content)
                    break  # Found content for this section, move to next

        return " ".join(content_parts) if content_parts else ""

    def scrape_page_sections(self, url):
        """
        Scrape specific sections from a Mayo Clinic page.

        Args:
            url: URL to scrape

        Returns:
            Dictionary with extracted section content
        """
        print(f"🔍 Scraping: {url}")

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # Extract disease name
            disease_name = self.extract_disease_name_from_url(url)

            # Define section mappings
            sections = {
                "overview": ["Overview", "What is", "About", "Definition"],
                "symptoms": ["Symptoms", "Signs and symptoms", "Warning signs"],
                "causes": ["Causes", "What causes", "Etiology"],
                "risk_factors": [
                    "Risk factors",
                    "Risk",
                    "Who's at risk",
                    "Factors that increase",
                ],
                "complications": [
                    "Complications",
                    "Possible complications",
                    "When to see",
                ],
            }

            # Extract content for each section
            extracted_data = {
                "disease_name": disease_name,
                "source_url": url,
                "overview": "",
                "symptoms": "",
                "causes": "",
                "risk_factors": "",
                "complications": "",
            }

            for section_key, header_variations in sections.items():
                content = self.extract_section_content(soup, header_variations)
                extracted_data[section_key] = self.clean_text(content)

                if content:
                    print(f"  ✅ Found {section_key}: {len(content)} characters")
                else:
                    print(f"  ⚠️ No content found for {section_key}")

            return extracted_data

        except requests.RequestException as e:
            print(f"❌ Error fetching {url}: {e}")
            return None
        except Exception as e:
            print(f"❌ Error parsing {url}: {e}")
            return None

    def insert_into_database(self, data):
        """Insert extracted data into the symptom table."""
        if not data:
            return False

        cursor = self.connection.cursor()

        try:
            insert_query = """
            INSERT INTO symptom (disease_name, source_url, overview, symptoms, causes, risk_factors, complications)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                overview = VALUES(overview),
                symptoms = VALUES(symptoms),
                causes = VALUES(causes),
                risk_factors = VALUES(risk_factors),
                complications = VALUES(complications),
                updated_at = CURRENT_TIMESTAMP
            """

            values = (
                data["disease_name"],
                data["source_url"],
                data["overview"],
                data["symptoms"],
                data["causes"],
                data["risk_factors"],
                data["complications"],
            )

            cursor.execute(insert_query, values)
            self.connection.commit()

            print(f"✅ Inserted data for {data['disease_name']}")
            return True

        except Error as e:
            print(f"❌ Database error: {e}")
            self.connection.rollback()
            return False
        finally:
            cursor.close()

    def scrape_urls(self, urls):
        """Scrape multiple URLs and insert into database."""
        print("🚀 MAYO CLINIC SECTION SCRAPER")
        print("Extracting: Overview, Symptoms, Causes, Risk factors, Complications")
        print("=" * 70)

        successful = 0
        failed = 0

        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processing URL...")

            # Extract sections from the page
            data = self.scrape_page_sections(url)

            if data:
                # Insert into database
                if self.insert_into_database(data):
                    successful += 1
                else:
                    failed += 1
            else:
                failed += 1

            # Add delay between requests to be respectful
            if i < len(urls):
                time.sleep(2)

        print(f"\n📊 SCRAPING SUMMARY")
        print("=" * 30)
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Total: {len(urls)}")

        return successful, failed

    def display_database_content(self):
        """Display the content stored in the database."""
        cursor = self.connection.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM symptom ORDER BY disease_name")
            results = cursor.fetchall()

            print(f"\n📋 DATABASE CONTENT")
            print("=" * 50)

            for record in results:
                print(f"\n🏥 Disease: {record['disease_name']}")
                print(f"📄 URL: {record['source_url']}")

                for section in [
                    "overview",
                    "symptoms",
                    "causes",
                    "risk_factors",
                    "complications",
                ]:
                    content = record[section]
                    if content:
                        print(f"\n📝 {section.replace('_', ' ').title()}:")
                        # Show first 200 characters
                        preview = (
                            content[:200] + "..." if len(content) > 200 else content
                        )
                        print(f"   {preview}")
                    else:
                        print(
                            f"\n❌ {section.replace('_', ' ').title()}: No content found"
                        )

                print("-" * 50)

        except Error as e:
            print(f"❌ Error reading database: {e}")
        finally:
            cursor.close()

    def close_connection(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()


def main():
    """Main function to test scraping with the specified URLs."""

    # Test URLs as specified by the user
    test_urls = [
        "https://www.mayoclinic.org/diseases-conditions/heart-disease/symptoms-causes/syc-20353118",
        "https://www.mayoclinic.org/diseases-conditions/asthma/symptoms-causes/syc-20369653",
    ]

    scraper = MayoClinicSectionScraper()

    try:
        # Scrape the URLs
        successful, failed = scraper.scrape_urls(test_urls)

        # Display the results
        scraper.display_database_content()

        if successful > 0:
            print(f"\n🎉 Successfully scraped and stored {successful} pages!")
            print("You can now check the 'symptom' table in your MySQL database.")
        else:
            print(f"\n❌ No pages were successfully scraped.")

    finally:
        scraper.close_connection()


if __name__ == "__main__":
    main()
