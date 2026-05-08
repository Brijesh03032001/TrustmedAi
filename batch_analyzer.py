#!/usr/bin/env python3
"""
Batch Medical URL Analyzer

This script processes multiple medical URLs from a file and extracts structured JSON data
for each URL using the enhanced URL summarizer functionality.

Requirements:
- Ollama installed and running with LLaMA 3.2 model
- All dependencies from url_summarizer.py

Usage:
    python batch_analyzer.py urls.txt
    or create urls.txt and run:
    python batch_analyzer.py
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Import functions from url_summarizer
from url_summarizer import (
    detect_url_type,
    get_disease_name_from_url,
    create_specialized_chain,
    load_webpage_content,
    extract_json_from_response,
    save_json_to_file,
)

 
def process_url_batch(
    url: str, consolidated_data: dict, output_dir: str = "batch_results"
) -> dict:
    """
    Process a single URL and add results to consolidated data structure.

    Args:
        url (str): The URL to process
        consolidated_data (dict): Dictionary to store consolidated results by content type
        output_dir (str): Directory to save results

    Returns:
        dict: Processing results with metadata
    """
    try:
        print(f"\n🔄 Processing: {url}")

        # Detect content type and extract disease name
        content_type = detect_url_type(url)
        disease_name = get_disease_name_from_url(url)

        print(f"   Type: {content_type} | Disease: {disease_name}")

        # Load webpage content
        content = load_webpage_content(url)

        # Create specialized chain
        chain = create_specialized_chain(content_type, disease_name)

        # Limit content length
        max_content_length = 6000
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."

        # Generate analysis
        response = chain.invoke({"text": content, "disease_name": disease_name})
        parsed_data = extract_json_from_response(response.strip())

        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Add to consolidated data if successful
        if "error" not in parsed_data:
            # Initialize content type list if it doesn't exist
            if content_type not in consolidated_data:
                consolidated_data[content_type] = {
                    "metadata": {
                        "content_type": content_type,
                        "total_diseases": 0,
                        "processed_urls": [],
                    },
                    "diseases": [],
                }

            # Add the disease data to consolidated structure
            disease_entry = {
                "source_url": url,
                "disease_name": disease_name,
                "analysis": parsed_data,
            }

            consolidated_data[content_type]["diseases"].append(disease_entry)
            consolidated_data[content_type]["metadata"]["total_diseases"] += 1
            consolidated_data[content_type]["metadata"]["processed_urls"].append(url)

            print(f"   ✅ Added to {content_type} collection")

            return {
                "url": url,
                "status": "success",
                "content_type": content_type,
                "disease_name": disease_name,
                "data": parsed_data,
            }
        else:
            print(f"   ❌ Error: {parsed_data.get('error', 'Unknown error')}")
            return {
                "url": url,
                "status": "error",
                "error": parsed_data.get("error", "Unknown error"),
                "content_type": content_type,
                "disease_name": disease_name,
            }

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return {"url": url, "status": "exception", "error": str(e)}


def save_consolidated_files(consolidated_data: dict, output_dir: str):
    """
    Save consolidated JSON files by content type.

    Args:
        consolidated_data (dict): Dictionary containing consolidated data by content type
        output_dir (str): Output directory
    """
    import datetime

    for content_type, data in consolidated_data.items():
        # Add timestamp to metadata
        data["metadata"]["generated_at"] = datetime.datetime.now().isoformat()
        data["metadata"]["description"] = (
            f"Consolidated {content_type} analysis for multiple diseases"
        )

        # Save consolidated file
        filename = f"{content_type}.json"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"💾 Consolidated {content_type} file saved: {filepath}")
        print(f"   Contains {data['metadata']['total_diseases']} diseases")


def create_summary_report(results: list, consolidated_data: dict, output_dir: str):
    """
    Create a summary report of all processed URLs and consolidated data.

    Args:
        results (list): List of processing results
        consolidated_data (dict): Dictionary containing consolidated data
        output_dir (str): Output directory
    """
    # Create summary statistics
    total_urls = len(results)
    successful = len([r for r in results if r["status"] == "success"])
    errors = len([r for r in results if r["status"] in ["error", "exception"]])

    # Group by content type
    content_types = {}
    diseases = {}

    for result in results:
        if result["status"] == "success":
            content_type = result["content_type"]
            disease = result["disease_name"]

            content_types[content_type] = content_types.get(content_type, 0) + 1
            diseases[disease] = diseases.get(disease, 0) + 1

    # Add consolidated data info
    consolidated_info = {}
    for content_type, data in consolidated_data.items():
        consolidated_info[content_type] = {
            "total_diseases": data["metadata"]["total_diseases"],
            "processed_urls": len(data["metadata"]["processed_urls"]),
        }

    # Create summary report
    summary = {
        "batch_summary": {
            "total_urls": total_urls,
            "successful": successful,
            "errors": errors,
            "success_rate": f"{(successful / total_urls) * 100:.1f}%"
            if total_urls > 0
            else "0%",
        },
        "content_type_distribution": content_types,
        "disease_distribution": diseases,
        "consolidated_files": consolidated_info,
        "detailed_results": results,
    }

    # Save summary report
    summary_path = os.path.join(output_dir, "batch_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n📊 BATCH PROCESSING SUMMARY")
    print("=" * 50)
    print(f"Total URLs processed: {total_urls}")
    print(f"Successful: {successful}")
    print(f"Errors: {errors}")
    print(f"Success rate: {summary['batch_summary']['success_rate']}")

    if content_types:
        print(f"\nContent Types:")
        for content_type, count in content_types.items():
            print(f"  {content_type}: {count}")

    if diseases:
        print(f"\nDiseases Analyzed:")
        for disease, count in diseases.items():
            print(f"  {disease}: {count}")

    print(f"\n📄 Summary report saved: {summary_path}")


def main():
    """Main function for batch processing."""

    parser = argparse.ArgumentParser(
        description="Batch process medical URLs for structured analysis"
    )
    parser.add_argument(
        "urls_file",
        nargs="?",
        default="urls.txt",
        help="File containing URLs (one per line)",
    )
    parser.add_argument(
        "--output", "-o", default="batch_results", help="Output directory for results"
    )
    args = parser.parse_args()

    # Check if URLs file exists
    if not os.path.exists(args.urls_file):
        print(f"❌ URLs file not found: {args.urls_file}")
        print(
            f"\nCreate a file '{args.urls_file}' with URLs (one per line), for example:"
        )
        print(
            "https://www.mayoclinic.org/diseases-conditions/stroke/symptoms-causes/syc-20350113"
        )
        print(
            "https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444"
        )
        print(
            "https://www.mayoclinic.org/diseases-conditions/heart-disease/symptoms-causes/syc-20353118"
        )
        return

    # Read URLs from file
    with open(args.urls_file, "r", encoding="utf-8") as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    if not urls:
        print(f"❌ No valid URLs found in {args.urls_file}")
        return

    print(f"🚀 BATCH MEDICAL URL ANALYZER (CONSOLIDATED MODE)")
    print(f"Processing {len(urls)} URLs from {args.urls_file}")
    print(f"Output directory: {args.output}")
    print("📋 Will create consolidated JSON files by content type")
    print("=" * 60)

    # Initialize consolidated data structure
    consolidated_data = {}

    # Process each URL
    results = []
    for i, url in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}]", end=" ")
        result = process_url_batch(url, consolidated_data, args.output)
        results.append(result)

    # Save consolidated JSON files
    print(f"\n📁 SAVING CONSOLIDATED FILES")
    print("=" * 40)
    save_consolidated_files(consolidated_data, args.output)

    # Create summary report
    create_summary_report(results, consolidated_data, args.output)

    print(f"\n🎉 Batch processing completed!")
    print(f"Consolidated files saved in: {args.output}/")
    print(f"📋 Generated files:")
    for content_type in consolidated_data.keys():
        print(f"   - {content_type}.json")
    print(f"   - batch_summary.json")


if __name__ == "__main__":
    main()
