import requests
import xml.etree.ElementTree as ET
import pandas as pd
import re
from urllib.parse import urlparse

def clean_and_categorize_urls():
    """
    Fetches the Mayo Clinic XML sitemap, cleans the URLs by removing timestamps,
    categorizes them, and saves the result to an Excel file.
    """
    # URL of the XML sitemap
    xml_url = 'https://www.mayoclinic.org/condition_consolidated_concepts.xml'
    
    print(f"Fetching XML sitemap from {xml_url}...")
    
    try:
        # Send a GET request to the URL
        response = requests.get(xml_url)
        # Raise an exception for bad status codes (4xx or 5xx)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the XML file: {e}")
        return

    print("Successfully fetched XML. Parsing URLs...")
    
    # Parse the XML content from the response
    root = ET.fromstring(response.content)
    
    # A list to hold our structured data
    url_data = []

    # The XML file uses a namespace, which we need to handle to find elements
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

    # Loop through each <url> tag in the XML
    for url_element in root.findall('ns:url', namespace):
        loc_element = url_element.find('ns:loc', namespace)
        if loc_element is not None:
            original_url = loc_element.text
            
            # --- URL Cleaning Logic ---
            # Use regex to find the base URL and remove the trailing timestamp.
            # This pattern looks for the part of the URL up to syc-12345, mac-12345, etc.
            match = re.search(r'(https://.*/(?:syc|mac|drc|art|faq)-\d+)', original_url)
            
            if not match:
                continue # Skip URLs that don't match our desired pattern
                
            clean_url = match.group(1)
            
            # --- Data Extraction Logic ---
            disease_name = None
            url_type = None
            
            # Extract disease name (the part after /diseases-conditions/)
            disease_match = re.search(r'/diseases-conditions/([^/]+)', clean_url)
            if disease_match:
                disease_name = disease_match.group(1)
                
            # Categorize the URL based on keywords
            if 'symptoms-causes' in clean_url:
                url_type = 'symptoms'
            elif 'diagnosis-treatment' in clean_url:
                url_type = 'diagnosis'
            elif 'doctors-departments' in clean_url:
                url_type = 'doctor_department'
            elif 'care-at-mayo-clinic' in clean_url:
                url_type = 'care_at_mayo_clinic'

            # Only add the data if we successfully extracted a disease name and type
            if disease_name and url_type:
                url_data.append({
                    'disease_name': disease_name,
                    'type': url_type,
                    'url': clean_url
                })

    if not url_data:
        print("No matching URLs were found or processed.")
        return
        
    print(f"Processed {len(url_data)} relevant URLs. Creating Excel file...")

    # --- Excel Export Logic ---
    # Convert the list of dictionaries to a pandas DataFrame
    df = pd.DataFrame(url_data)
    
    # Save the DataFrame to an Excel file
    output_filename = 'mayoclinic_urls.xlsx'
    try:
        df.to_excel(output_filename, index=False, engine='openpyxl')
        print(f"Successfully created Excel file: {output_filename}")
    except Exception as e:
        print(f"Error saving to Excel file: {e}")

if __name__ == '__main__':
    # To run this script, you need to install the required libraries:
    # pip install requests pandas openpyxl
    clean_and_categorize_urls()
