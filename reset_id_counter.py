#!/usr/bin/env python3
"""
Reset Database ID Counter

This script resets the symptom table IDs to start from 1.
"""

import mysql.connector
from mysql.connector import Error


def reset_id_counter():
    """Reset the ID counter in symptom table to start from 1."""
    try:
        # Connect to database
        connection = mysql.connector.connect(
            host="localhost", database="medical_data", user="root"
        )

        cursor = connection.cursor()

        print("🔄 Resetting ID counter in symptom table...")

        # First, get current data
        cursor.execute("SELECT COUNT(*) FROM symptom")
        total_records = cursor.fetchone()[0]
        print(f"   Found {total_records} records to renumber")

        # Create a temporary table with new IDs
        print("   Creating temporary table...")
        cursor.execute("""
            CREATE TEMPORARY TABLE temp_symptom AS 
            SELECT disease_name, source_url, overview, symptoms, causes, risk_factors, complications
            FROM symptom 
            ORDER BY disease_name
        """)

        # Clear the original table
        print("   Clearing original table...")
        cursor.execute("DELETE FROM symptom")

        # Reset auto increment
        print("   Resetting auto increment...")
        cursor.execute("ALTER TABLE symptom AUTO_INCREMENT = 1")

        # Insert data back with new IDs starting from 1
        print("   Inserting data back with new IDs...")
        cursor.execute("""
            INSERT INTO symptom (disease_name, source_url, overview, symptoms, causes, risk_factors, complications)
            SELECT disease_name, source_url, overview, symptoms, causes, risk_factors, complications
            FROM temp_symptom
        """)

        # Commit changes
        connection.commit()

        # Verify the changes
        cursor.execute("SELECT MIN(id), MAX(id), COUNT(*) FROM symptom")
        min_id, max_id, count = cursor.fetchone()
        print(f"✅ Success! New ID range: {min_id} to {max_id} ({count} records)")

        # Show first few records
        cursor.execute("SELECT id, disease_name FROM symptom ORDER BY id LIMIT 5")
        records = cursor.fetchall()
        print("\nFirst 5 records with new IDs:")
        for record in records:
            print(f"  ID {record[0]}: {record[1]}")

        cursor.close()
        connection.close()

        return True

    except Error as e:
        print(f"❌ Error resetting ID counter: {e}")
        return False


def main():
    """Main function."""
    print("🔢 DATABASE ID RESET TOOL")
    print("Resetting symptom table IDs to start from 1")
    print("=" * 50)

    success = reset_id_counter()

    if success:
        print("\n🎉 ID reset completed successfully!")
        print("All symptom records now have sequential IDs starting from 1.")
    else:
        print("\n❌ ID reset failed. Please check the error messages above.")


if __name__ == "__main__":
    main()
