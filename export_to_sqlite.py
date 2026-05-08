#!/usr/bin/env python3
"""
MySQL to SQLite Database Export Tool

This script exports the medical symptom data from MySQL to a SQLite database file (.db).
SQLite databases are portable, self-contained, and don't require a server.

Usage:
    python export_to_sqlite.py
"""

import mysql.connector
from mysql.connector import Error
import sqlite3
import os
import sys
from datetime import datetime


class MySQLToSQLiteExporter:
    """Export MySQL data to SQLite database."""

    def __init__(self, sqlite_filename="medical_symptoms.db"):
        """Initialize with SQLite filename."""
        self.sqlite_filename = sqlite_filename
        self.mysql_connection = None
        self.sqlite_connection = None

    def connect_to_mysql(self):
        """Connect to MySQL database."""
        try:
            self.mysql_connection = mysql.connector.connect(
                host="localhost", user="root", database="medical_data"
            )
            print("✅ Connected to MySQL database")
            return True
        except Error as e:
            print(f"❌ MySQL connection error: {e}")
            return False

    def create_sqlite_database(self):
        """Create SQLite database and table structure."""
        try:
            # Remove existing file if it exists
            if os.path.exists(self.sqlite_filename):
                os.remove(self.sqlite_filename)
                print(f"🗑️ Removed existing {self.sqlite_filename}")

            # Create new SQLite connection
            self.sqlite_connection = sqlite3.connect(self.sqlite_filename)
            cursor = self.sqlite_connection.cursor()

            # Create the symptom table with same structure as MySQL
            create_table_sql = """
            CREATE TABLE symptom (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                disease_name TEXT NOT NULL,
                source_url TEXT NOT NULL,
                overview TEXT,
                symptoms TEXT,
                causes TEXT,
                risk_factors TEXT,
                complications TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(disease_name, source_url)
            );
            """

            cursor.execute(create_table_sql)

            # Create indexes for better performance
            cursor.execute("CREATE INDEX idx_disease_name ON symptom(disease_name);")
            cursor.execute("CREATE INDEX idx_source_url ON symptom(source_url);")

            self.sqlite_connection.commit()
            print(f"✅ Created SQLite database: {self.sqlite_filename}")
            return True

        except sqlite3.Error as e:
            print(f"❌ SQLite error: {e}")
            return False

    def export_data(self):
        """Export data from MySQL to SQLite."""
        try:
            # Get MySQL cursor
            mysql_cursor = self.mysql_connection.cursor()

            # Get all data from MySQL
            mysql_cursor.execute("""
                SELECT id, disease_name, source_url, overview, symptoms, 
                       causes, risk_factors, complications
                FROM symptom 
                ORDER BY id
            """)

            mysql_data = mysql_cursor.fetchall()
            total_records = len(mysql_data)

            print(f"📊 Found {total_records:,} records to export")

            # Get SQLite cursor
            sqlite_cursor = self.sqlite_connection.cursor()

            # Insert data into SQLite (excluding id to let SQLite auto-increment)
            insert_sql = """
            INSERT INTO symptom (disease_name, source_url, overview, symptoms, 
                               causes, risk_factors, complications)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """

            successful_inserts = 0
            failed_inserts = 0

            for i, record in enumerate(mysql_data, 1):
                try:
                    # Skip the MySQL ID (record[0]) and insert other fields
                    sqlite_cursor.execute(insert_sql, record[1:])  # Skip ID
                    successful_inserts += 1

                    if i % 100 == 0 or i == total_records:
                        print(f"   Exported {i:,}/{total_records:,} records...")

                except sqlite3.Error as e:
                    print(f"❌ Error inserting record {record[1]}: {e}")
                    failed_inserts += 1

            # Commit all changes
            self.sqlite_connection.commit()

            print(f"\n📊 EXPORT SUMMARY")
            print("=" * 40)
            print(f"Total records: {total_records:,}")
            print(f"Successfully exported: {successful_inserts:,}")
            print(f"Failed exports: {failed_inserts:,}")
            print(f"Success rate: {(successful_inserts / total_records * 100):.1f}%")

            mysql_cursor.close()
            return successful_inserts

        except (Error, sqlite3.Error) as e:
            print(f"❌ Export error: {e}")
            return 0

    def verify_export(self):
        """Verify the exported data in SQLite."""
        try:
            cursor = self.sqlite_connection.cursor()

            # Check total count
            cursor.execute("SELECT COUNT(*) FROM symptom")
            total_count = cursor.fetchone()[0]

            # Check for complete records (no NULLs)
            cursor.execute("""
                SELECT COUNT(*) FROM symptom 
                WHERE overview IS NOT NULL AND overview != '' AND
                      symptoms IS NOT NULL AND symptoms != '' AND
                      causes IS NOT NULL AND causes != '' AND
                      risk_factors IS NOT NULL AND risk_factors != '' AND
                      complications IS NOT NULL AND complications != ''
            """)
            complete_count = cursor.fetchone()[0]

            # Get sample records
            cursor.execute("""
                SELECT disease_name, 
                       LENGTH(overview) as overview_len,
                       LENGTH(symptoms) as symptoms_len,
                       LENGTH(causes) as causes_len,
                       LENGTH(risk_factors) as risk_factors_len,
                       LENGTH(complications) as complications_len
                FROM symptom 
                ORDER BY disease_name 
                LIMIT 5
            """)

            sample_records = cursor.fetchall()

            print(f"\n🔍 VERIFICATION RESULTS")
            print("=" * 50)
            print(f"Total records in SQLite: {total_count:,}")
            print(f"Complete records: {complete_count:,}")
            print(f"Completion rate: {(complete_count / total_count * 100):.1f}%")

            print(f"\nSample records:")
            print(
                "Disease Name                 Overview Symptoms Causes Risk_Factors Complications"
            )
            print("-" * 80)

            for record in sample_records:
                print(
                    f"{record[0][:25]:25s} {record[1]:8d} {record[2]:8d} {record[3]:6d} {record[4]:12d} {record[5]:13d}"
                )

            return True

        except sqlite3.Error as e:
            print(f"❌ Verification error: {e}")
            return False

    def get_database_info(self):
        """Get information about the created database file."""
        try:
            # Get file size
            file_size = os.path.getsize(self.sqlite_filename)
            file_size_mb = file_size / (1024 * 1024)

            # Get database schema info
            cursor = self.sqlite_connection.cursor()
            cursor.execute(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name='symptom';"
            )
            table_schema = cursor.fetchone()[0]

            print(f"\n💾 DATABASE FILE INFORMATION")
            print("=" * 50)
            print(f"File: {os.path.abspath(self.sqlite_filename)}")
            print(f"Size: {file_size:,} bytes ({file_size_mb:.2f} MB)")
            print(f"Type: SQLite 3 Database")
            print(f"Portable: Yes - can be copied and used anywhere")

            print(f"\n📋 Database Schema:")
            print(table_schema)

            return True

        except Exception as e:
            print(f"❌ Error getting database info: {e}")
            return False

    def close_connections(self):
        """Close database connections."""
        if self.mysql_connection:
            self.mysql_connection.close()
            print("🔌 MySQL connection closed")

        if self.sqlite_connection:
            self.sqlite_connection.close()
            print("🔌 SQLite connection closed")

    def export(self):
        """Main export process."""
        print("🔄 MYSQL TO SQLITE EXPORT TOOL")
        print("Converting medical symptom database to portable SQLite format")
        print("=" * 80)

        try:
            # Step 1: Connect to MySQL
            if not self.connect_to_mysql():
                return False

            # Step 2: Create SQLite database
            if not self.create_sqlite_database():
                return False

            # Step 3: Export data
            exported_count = self.export_data()
            if exported_count == 0:
                return False

            # Step 4: Verify export
            if not self.verify_export():
                return False

            # Step 5: Show database information
            self.get_database_info()

            print(f"\n🎉 SUCCESS!")
            print(f"✅ Exported {exported_count:,} medical records to SQLite")
            print(f"✅ Database saved as: {self.sqlite_filename}")
            print(
                f"✅ File is portable and can be used with any SQLite-compatible tool"
            )

            return True

        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False

        finally:
            self.close_connections()


def main():
    """Main function."""
    # Check if sqlite3 is available
    try:
        import sqlite3

        print(f"SQLite version: {sqlite3.sqlite_version}")
    except ImportError:
        print("❌ SQLite3 not available")
        return

    # Get custom filename if provided
    import sys

    filename = "medical_symptoms.db"
    if len(sys.argv) > 1:
        filename = sys.argv[1]
        if not filename.endswith(".db"):
            filename += ".db"

    print(f"🎯 Target file: {filename}")
    print()

    # Create exporter and run
    exporter = MySQLToSQLiteExporter(filename)
    success = exporter.export()

    if success:
        print(f"\n💡 USAGE TIPS:")
        print(f"• Open with: sqlite3 {filename}")
        print(
            f"• Query example: SELECT * FROM symptom WHERE disease_name LIKE '%diabetes%';"
        )
        print(f"• Copy file anywhere - no server setup required!")
        print(f"• Compatible with Python sqlite3, DB Browser, and many other tools")
    else:
        print(f"\n❌ Export failed. Check the error messages above.")


if __name__ == "__main__":
    main()
