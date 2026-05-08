#!/usr/bin/env python3
"""
Consolidated Data Explorer

This script helps explore and analyze the consolidated JSON files created by batch_analyzer.py.
It provides easy access to view diseases by type and extract specific information.

Usage:
    python explore_data.py consolidated_results/
"""

import argparse
import json
import os
from typing import Dict, List


def load_consolidated_data(directory: str) -> Dict[str, dict]:
    """Load all consolidated JSON files from directory."""
    data = {}

    for filename in ["symptoms.json", "diagnosis.json"]:
        filepath = os.path.join(directory, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content_type = filename.replace(".json", "")
                data[content_type] = json.load(f)
                print(
                    f"✅ Loaded {content_type} data: {data[content_type]['metadata']['total_diseases']} diseases"
                )
        else:
            print(f"⚠️  File not found: {filepath}")

    return data


def list_diseases(data: Dict[str, dict]):
    """List all diseases by content type."""
    print(f"\n📋 DISEASE INVENTORY")
    print("=" * 50)

    for content_type, type_data in data.items():
        print(f"\n🔍 {content_type.upper()} ANALYSIS:")
        print(f"   Total diseases: {type_data['metadata']['total_diseases']}")

        for i, disease_entry in enumerate(type_data["diseases"], 1):
            disease_name = disease_entry["disease_name"]
            print(f"   {i}. {disease_name}")


def show_disease_details(
    data: Dict[str, dict], disease_name: str, content_type: str = None
):
    """Show detailed information for a specific disease."""
    found = False

    search_types = [content_type] if content_type else data.keys()

    for type_name in search_types:
        if type_name not in data:
            continue

        for disease_entry in data[type_name]["diseases"]:
            if disease_entry["disease_name"].lower() == disease_name.lower():
                found = True
                analysis = disease_entry["analysis"]

                print(
                    f"\n🏥 {disease_entry['disease_name']} - {type_name.upper()} ANALYSIS"
                )
                print("=" * 60)
                print(f"Source: {disease_entry['source_url']}")
                print()

                if type_name == "symptoms":
                    if "symptoms" in analysis:
                        print("🔴 SYMPTOMS:")
                        for i, symptom in enumerate(analysis["symptoms"], 1):
                            print(f"  {i}. {symptom}")

                    if "causes" in analysis:
                        print("\n🔵 CAUSES:")
                        for i, cause in enumerate(analysis["causes"], 1):
                            print(f"  {i}. {cause}")

                    if "prevention" in analysis:
                        print("\n🟢 PREVENTION:")
                        for i, prevention in enumerate(analysis["prevention"], 1):
                            print(f"  {i}. {prevention}")

                elif type_name == "diagnosis":
                    if "diagnostic_tests" in analysis:
                        print("🔬 DIAGNOSTIC TESTS:")
                        for i, test in enumerate(analysis["diagnostic_tests"], 1):
                            print(f"  {i}. {test}")

                    if "treatment_options" in analysis:
                        print("\n💊 TREATMENT OPTIONS:")
                        for i, treatment in enumerate(analysis["treatment_options"], 1):
                            print(f"  {i}. {treatment}")

                    if "medications" in analysis:
                        print("\n💉 MEDICATIONS:")
                        for i, med in enumerate(analysis["medications"], 1):
                            print(f"  {i}. {med}")

                    if "procedures" in analysis:
                        print("\n🏥 PROCEDURES:")
                        for i, procedure in enumerate(analysis["procedures"], 1):
                            print(f"  {i}. {procedure}")

                if "summary" in analysis:
                    print(f"\n📝 SUMMARY:")
                    print(f"   {analysis['summary']}")

                print("=" * 60)

    if not found:
        print(f"❌ Disease '{disease_name}' not found in the data.")
        print("Available diseases:")
        for content_type, type_data in data.items():
            for disease_entry in type_data["diseases"]:
                print(f"  - {disease_entry['disease_name']} ({content_type})")


def compare_diseases(data: Dict[str, dict], disease1: str, disease2: str):
    """Compare symptoms between two diseases."""
    print(f"\n🔄 COMPARING: {disease1} vs {disease2}")
    print("=" * 60)

    diseases_data = {}

    # Find both diseases in symptoms data
    if "symptoms" in data:
        for disease_entry in data["symptoms"]["diseases"]:
            disease_name = disease_entry["disease_name"]
            if disease_name.lower() in [disease1.lower(), disease2.lower()]:
                diseases_data[disease_name] = disease_entry["analysis"]

    if len(diseases_data) < 2:
        print("❌ Could not find both diseases in symptoms data for comparison.")
        return

    disease_names = list(diseases_data.keys())

    print(f"📊 SYMPTOMS COMPARISON:")
    print(f"\n{disease_names[0]}:")
    for symptom in diseases_data[disease_names[0]].get("symptoms", []):
        print(f"  • {symptom}")

    print(f"\n{disease_names[1]}:")
    for symptom in diseases_data[disease_names[1]].get("symptoms", []):
        print(f"  • {symptom}")


def interactive_mode(data: Dict[str, dict]):
    """Interactive exploration mode."""
    print(f"\n🎯 INTERACTIVE MODE")
    print("Available commands:")
    print("  list - Show all diseases")
    print("  show <disease_name> - Show details for a disease")
    print("  compare <disease1> <disease2> - Compare two diseases")
    print("  quit - Exit")

    while True:
        try:
            command = input(f"\n> ").strip().split()

            if not command:
                continue

            if command[0].lower() == "quit":
                break
            elif command[0].lower() == "list":
                list_diseases(data)
            elif command[0].lower() == "show" and len(command) > 1:
                disease_name = " ".join(command[1:])
                show_disease_details(data, disease_name)
            elif command[0].lower() == "compare" and len(command) > 2:
                disease1 = command[1]
                disease2 = " ".join(command[2:])
                compare_diseases(data, disease1, disease2)
            else:
                print("Invalid command. Type 'quit' to exit.")

        except KeyboardInterrupt:
            print(f"\n👋 Goodbye!")
            break


def main():
    parser = argparse.ArgumentParser(description="Explore consolidated medical data")
    parser.add_argument(
        "directory",
        nargs="?",
        default="consolidated_results",
        help="Directory containing consolidated JSON files",
    )
    parser.add_argument("--disease", "-d", help="Show details for specific disease")
    parser.add_argument("--list", "-l", action="store_true", help="List all diseases")
    parser.add_argument(
        "--interactive", "-i", action="store_true", help="Interactive mode"
    )

    args = parser.parse_args()

    if not os.path.exists(args.directory):
        print(f"❌ Directory not found: {args.directory}")
        return

    print(f"📂 Loading consolidated data from: {args.directory}")
    data = load_consolidated_data(args.directory)

    if not data:
        print("❌ No consolidated data files found.")
        return

    if args.list:
        list_diseases(data)
    elif args.disease:
        show_disease_details(data, args.disease)
    elif args.interactive:
        list_diseases(data)
        interactive_mode(data)
    else:
        list_diseases(data)
        print(f"\nUse --help for more options or --interactive for interactive mode")


if __name__ == "__main__":
    main()
