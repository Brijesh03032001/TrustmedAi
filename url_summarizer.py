#!/usr/bin/env python3
"""
URL Summarizer Script using Ollama and LangChain

This script takes a URL as input, fetches the webpage content using WebBaseLoader,
and generates a summary using LLaMA 3.2 model through Ollama.

Requirements:
- Ollama installed and running with LLaMA 3.2 model
- Python packages: langchain, langchain-ollama, langchain-community, langchain-core

Usage:
    python url_summarizer.py
    Enter URL when prompted, or pass it as command line argument:
    python url_summarizer.py https://example.com
"""

import argparse
import json
import re
import datetime

from langchain_community.document_loaders import WebBaseLoader
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser


def detect_url_type(url: str) -> str:
    """
    Detect the type of medical content based on URL patterns.

    Args:
        url (str): The URL to analyze

    Returns:
        str: The detected content type
    """
    url_lower = url.lower()

    if "symptoms-causes" in url_lower or "symptoms" in url_lower:
        return "symptoms"
    elif (
        "diagnosis-treatment" in url_lower
        or "diagnosis" in url_lower
        or "treatment" in url_lower
    ):
        return "diagnosis"
    elif "doctors-departments" in url_lower or "doctor" in url_lower:
        return "doctor_department"
    elif "care-at-mayo-clinic" in url_lower or "care" in url_lower:
        return "care_at_mayo_clinic"
    else:
        return "general"


def get_disease_name_from_url(url: str) -> str:
    """
    Extract disease name from Mayo Clinic URL pattern.

    Args:
        url (str): The URL to extract disease name from

    Returns:
        str: The disease name or 'unknown' if not found
    """
    # Extract disease name from URL pattern like /diseases-conditions/stroke/
    match = re.search(r"/diseases-conditions/([^/]+)", url)
    if match:
        disease_name = match.group(1).replace("-", " ").title()
        return disease_name
    return "Unknown Disease"


def create_specialized_chain(content_type: str, disease_name: str):
    """
    Creates a specialized summarization chain based on content type.

    Args:
        content_type (str): The type of medical content
        disease_name (str): The name of the disease

    Returns:
        LangChain chain for specialized summarization
    """
    # Initialize Ollama LLM with LLaMA 3.2 model
    llm = OllamaLLM(
        model="llama3.2",
        temperature=0.1,  # Very low temperature for consistent JSON output
    )

    # Create specialized prompts based on content type
    if content_type == "symptoms":
        template = """Extract symptoms, causes, and prevention information from this medical content about {disease_name}.

Content:
{text}

IMPORTANT: Return ONLY valid JSON format with no additional text, explanations, or formatting. Use this exact structure:

{{
  "disease_name": "{disease_name}",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "causes": ["cause1", "cause2", "cause3"],
  "prevention": ["prevention1", "prevention2", "prevention3"],
  "summary": "brief medical summary"
}}"""
    elif content_type == "diagnosis":
        template = """Extract diagnosis and treatment information from this medical content about {disease_name}.

Content:
{text}

IMPORTANT: Return ONLY valid JSON format with no additional text, explanations, or formatting. Use this exact structure:

{{
  "disease_name": "{disease_name}",
  "diagnostic_tests": ["test1", "test2", "test3"],
  "treatment_options": ["treatment1", "treatment2", "treatment3"],
  "medications": ["med1", "med2", "med3"],
  "procedures": ["procedure1", "procedure2", "procedure3"],
  "summary": "brief medical summary"
}}"""
    else:
        # General template for other content types
        template = """Extract key medical information from this content about {disease_name}.

Content:
{text}

IMPORTANT: Return ONLY valid JSON format with no additional text, explanations, or formatting. Use this exact structure:

{{
  "disease_name": "{disease_name}",
  "key_points": ["point1", "point2", "point3"],
  "important_information": ["info1", "info2", "info3"],
  "summary": "brief medical summary"
}}"""

    # Create a prompt template
    prompt_template = PromptTemplate(
        input_variables=["text", "disease_name"], template=template
    )

    # Create the chain
    chain = prompt_template | llm | StrOutputParser()

    return chain


def extract_json_from_response(response: str) -> dict:
    """
    Extract and parse JSON from the model response.

    Args:
        response (str): The raw response from the model

    Returns:
        dict: Parsed JSON data or error information
    """
    try:
        # Try to find JSON in the response
        # Look for content between first { and last }
        start_idx = response.find("{")
        end_idx = response.rfind("}")

        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            json_str = response[start_idx : end_idx + 1]
            parsed_json = json.loads(json_str)
            return parsed_json
        else:
            # If no JSON found, return the response as text
            return {
                "error": "No valid JSON found in response",
                "raw_response": response,
            }
    except json.JSONDecodeError as e:
        return {"error": f"JSON parsing error: {str(e)}", "raw_response": response}


def create_summarization_chain():
    """
    Creates a summarization chain using Ollama LLaMA 3.2 model.

    Returns:
        LangChain chain for text summarization
    """
    # Initialize Ollama LLM with LLaMA 3.2 model
    llm = OllamaLLM(
        model="llama3.2",
        temperature=0.3,  # Lower temperature for more focused summaries
    )

    # Create a prompt template for summarization
    prompt_template = PromptTemplate(
        input_variables=["text"],
        template="""
        Please provide a comprehensive yet concise summary of the following text. 
        Focus on the main points, key information, and important details:

        {text}

        Summary:
        """,
    )

    # Create the chain
    chain = prompt_template | llm | StrOutputParser()

    return chain


def load_webpage_content(url: str) -> str:
    """
    Load and extract text content from a webpage.

    Args:
        url (str): The URL to load content from

    Returns:
        str: Extracted text content from the webpage

    Raises:
        Exception: If there's an error loading the webpage
    """
    try:
        print(f"Loading content from: {url}")

        # Use WebBaseLoader to fetch webpage content
        loader = WebBaseLoader(url)
        documents = loader.load()

        if not documents:
            raise Exception("No content could be extracted from the webpage")

        # Combine all document content (in case of multiple documents)
        content = "\n".join([doc.page_content for doc in documents])

        print(f"Successfully loaded {len(content)} characters from the webpage")
        return content

    except Exception as e:
        raise Exception(f"Error loading webpage content: {str(e)}")


def summarize_url(url: str) -> tuple[dict, str]:
    """
    Summarize content from a given URL with specialized medical analysis.

    Args:
        url (str): The URL to summarize

    Returns:
        tuple: (parsed_json_data, content_type)
    """
    try:
        # Detect content type and extract disease name
        content_type = detect_url_type(url)
        disease_name = get_disease_name_from_url(url)

        print(f"Detected content type: {content_type}")
        print(f"Detected disease: {disease_name}")

        # Load webpage content
        content = load_webpage_content(url)

        # Create specialized chain based on content type
        chain = create_specialized_chain(content_type, disease_name)

        # Limit content length to avoid token limits (roughly 6000 characters for JSON output)
        max_content_length = 8000
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."
            print(f"Content truncated to {max_content_length} characters")

        print(f"Generating specialized {content_type} analysis using LLaMA 3.2...")

        # Generate summary with disease name context
        response = chain.invoke({"text": content, "disease_name": disease_name})

        # Extract JSON from response
        parsed_data = extract_json_from_response(response.strip())

        return parsed_data, content_type

    except Exception as e:
        return {
            "error": f"Error generating summary: {str(e)}",
            "content_type": content_type if "content_type" in locals() else "unknown",
        }, "error"


def save_json_to_file(data: dict, url: str, content_type: str):
    """
    Save the JSON data to a file.

    Args:
        data (dict): The JSON data to save
        url (str): The source URL
        content_type (str): The type of content analyzed
    """
    try:
        # Create a filename based on disease name and content type
        disease_name = data.get("disease_name", "unknown").lower().replace(" ", "_")
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        filename = f"{disease_name}_{content_type}_{timestamp}.json"

        # Add metadata to the JSON
        output_data = {
            "metadata": {
                "source_url": url,
                "content_type": content_type,
                "extracted_at": datetime.datetime.now().isoformat(),
                "disease_name": data.get("disease_name", "Unknown"),
            },
            "analysis": data,
        }

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"\n💾 JSON data saved to: {filename}")

    except Exception as e:
        print(f"\n❌ Error saving JSON file: {str(e)}")


def display_json_results(data: dict, content_type: str):
    """
    Display the JSON results in a formatted way.

    Args:
        data (dict): The parsed JSON data
        content_type (str): The type of content analyzed
    """
    print("\nSTRUCTURED ANALYSIS RESULTS:")
    print("=" * 70)

    if "error" in data:
        print(f"❌ Error: {data['error']}")
        if "raw_response" in data:
            print(f"\nRaw Response:\n{data['raw_response']}")
        return

    # Display based on content type
    if content_type == "symptoms":
        print(f"🏥 Disease: {data.get('disease_name', 'Unknown')}")
        print(f"📋 Content Type: Symptoms & Causes Analysis")
        print("-" * 70)

        if "symptoms" in data and data["symptoms"]:
            print("🔴 SYMPTOMS:")
            for i, symptom in enumerate(data["symptoms"], 1):
                print(f"  {i}. {symptom}")

        if "causes" in data and data["causes"]:
            print("\n🔵 CAUSES & RISK FACTORS:")
            for i, cause in enumerate(data["causes"], 1):
                print(f"  {i}. {cause}")

        if "prevention" in data and data["prevention"]:
            print("\n🟢 PREVENTION:")
            for i, prevention in enumerate(data["prevention"], 1):
                print(f"  {i}. {prevention}")

    elif content_type == "diagnosis":
        print(f"🏥 Disease: {data.get('disease_name', 'Unknown')}")
        print(f"📋 Content Type: Diagnosis & Treatment Analysis")
        print("-" * 70)

        if "diagnostic_tests" in data and data["diagnostic_tests"]:
            print("🔬 DIAGNOSTIC TESTS:")
            for i, test in enumerate(data["diagnostic_tests"], 1):
                print(f"  {i}. {test}")

        if "treatment_options" in data and data["treatment_options"]:
            print("\n💊 TREATMENT OPTIONS:")
            for i, treatment in enumerate(data["treatment_options"], 1):
                print(f"  {i}. {treatment}")

        if "medications" in data and data["medications"]:
            print("\n💉 MEDICATIONS:")
            for i, medication in enumerate(data["medications"], 1):
                print(f"  {i}. {medication}")

        if "procedures" in data and data["procedures"]:
            print("\n🏥 PROCEDURES:")
            for i, procedure in enumerate(data["procedures"], 1):
                print(f"  {i}. {procedure}")

    else:
        # General content display
        print(f"🏥 Disease: {data.get('disease_name', 'Unknown')}")
        print(f"📋 Content Type: General Analysis")
        print("-" * 70)

        if "key_points" in data and data["key_points"]:
            print("📌 KEY POINTS:")
            for i, point in enumerate(data["key_points"], 1):
                print(f"  {i}. {point}")

        if "important_information" in data and data["important_information"]:
            print("\n⚠️ IMPORTANT INFORMATION:")
            for i, info in enumerate(data["important_information"], 1):
                print(f"  {i}. {info}")

    # Always show summary if available
    if "summary" in data and data["summary"]:
        print(f"\n📝 SUMMARY:")
        print(f"   {data['summary']}")

    print("\n" + "=" * 70)

    # Display raw JSON for copying
    print("\n📄 RAW JSON DATA:")
    print("-" * 70)
    print(json.dumps(data, indent=2))
    print("-" * 70)


def main():
    """Main function to handle command line arguments and user interaction."""

    parser = argparse.ArgumentParser(
        description="Analyze medical webpage content using LLaMA 3.2 with structured JSON output"
    )
    parser.add_argument("url", nargs="?", help="URL to analyze")
    parser.add_argument(
        "--save", "-s", action="store_true", help="Save JSON results to file"
    )
    args = parser.parse_args()

    # Get URL from command line argument or user input
    if args.url:
        url = args.url
    else:
        url = input("Enter the medical URL you want to analyze: ").strip()

    if not url:
        print("Error: No URL provided")
        return

    # Add protocol if missing
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
        print(f"Added https:// protocol: {url}")

    print("-" * 70)
    print("🏥 MEDICAL CONTENT ANALYZER")
    print("Specialized AI Analysis for Medical Websites")
    print("-" * 70)

    # Generate structured analysis
    json_data, content_type = summarize_url(url)

    # Display results
    display_json_results(json_data, content_type)

    # Save to file if requested or if not in error state
    if (
        args.save or input("\n💾 Save JSON to file? (y/N): ").lower().startswith("y")
    ) and content_type != "error":
        save_json_to_file(json_data, url, content_type)


if __name__ == "__main__":
    main()
