import pandas as pd
import re


def clean_and_categorize_urls():
    """
    Processes a list of Mayo Clinic URLs, cleans them by removing timestamps,
    categorizes them, and saves the result to an Excel file.
    """
    # A raw string containing the test URLs provided by the user
    raw_url_data = """
    https://www.mayoclinic.org/diseases-conditions/congenital-heart-defects-children/symptoms-causes/syc-203500742024-06-18T21:31:52-05:00https://www.mayoclinic.org/diseases-conditions/congenital-heart-defects-children/care-at-mayo-clinic/mac-203500832024-06-18T21:40:09-05:00https://www.mayoclinic.org/diseases-conditions/congenital-heart-defects-children/diagnosis-treatment/drc-203500802024-06-18T21:35:27-05:00https://www.mayoclinic.org/diseases-conditions/brain-tumor/care-at-mayo-clinic/mac-203500922024-02-01T14:41:17-06:00https://www.mayoclinic.org/diseases-conditions/brain-tumor/diagnosis-treatment/drc-203500882025-04-03T22:15:50-05:00https://www.mayoclinic.org/diseases-conditions/brain-tumor/symptoms-causes/syc-203500842023-03-31T18:42:30-05:00https://www.mayoclinic.org/diseases-conditions/epilepsy/care-at-mayo-clinic/mac-203501022025-09-30T21:26:27-05:00https://www.mayoclinic.org/diseases-conditions/epilepsy/diagnosis-treatment/drc-203500982021-11-18T22:32:56-06:00https://www.mayoclinic.org/diseases-conditions/epilepsy/symptoms-causes/syc-203500932021-11-18T22:32:30-06:00https://www.mayoclinic.org/diseases-conditions/spinal-cord-tumor/symptoms-causes/syc-203501032025-03-06T19:22:27-06:00https://www.mayoclinic.org/diseases-conditions/spinal-cord-tumor/care-at-mayo-clinic/mac-203501122025-03-06T19:22:39-06:00https://www.mayoclinic.org/diseases-conditions/spinal-cord-tumor/diagnosis-treatment/drc-203501082025-03-06T19:22:27-06:00https://www.mayoclinic.org/diseases-conditions/stroke/care-at-mayo-clinic/mac-203501222023-12-07T19:13:44-06:00https://www.mayoclinic.org/diseases-conditions/stroke/diagnosis-treatment/drc-203501192023-12-07T19:13:52-06:00https://www.mayoclinic.org/diseases-conditions/stroke/symptoms-causes/syc-203501132023-12-07T19:13:45-06:00https://www.mayoclinic.org/diseases-conditions/vertebral-tumor/care-at-mayo-clinic/mac-203501312024-07-26T19:26:21-05:00https://www.mayoclinic.org/diseases-conditions/vertebral-tumor/diagnosis-treatment/drc-203501272024-07-26T17:40:45-05:00https://www.mayoclinic.org/diseases-conditions/vertebral-tumor/symptoms-causes/syc-203501232024-07-26T19:26:19-05:00https://www.mayoclinic.org/diseases-conditions/brain-metastases/care-at-mayo-clinic/mac-203501432024-11-19T16:57:15-06:00https://www.mayoclinic.org/diseases-conditions/brain-metastases/diagnosis-treatment/drc-203501402024-11-19T16:57:06-06:00https://www.mayoclinic.org/diseases-conditions/brain-metastases/symptoms-causes/syc-203501362024-11-19T17:17:38-06:00https://www.mayoclinic.org/diseases-conditions/tinnitus/diagnosis-treatment/drc-203501622021-02-03T17:12:57-06:00https://www.mayoclinic.org/diseases-conditions/tinnitus/symptoms-causes/syc-203501562021-02-03T17:12:57-06:00https://www.mayoclinic.org/diseases-conditions/tricuspid-valve-regurgitation/care-at-mayo-clinic/mac-203501772024-03-11T13:51:32-05:00https://www.mayoclinic.org/diseases-conditions/tricuspid-valve-regurgitation/diagnosis-treatment/drc-203501732024-03-08T18:47:42-06:00https://www.mayoclinic.org/diseases-conditions/tricuspid-valve-regurgitation/symptoms-causes/syc-203501682024-03-11T13:17:55-05:00https://www.mayoclinic.org/diseases-conditions/mitral-valve-regurgitation/care-at-mayo-clinic/mac-203501872022-02-07T19:48:57-06:00https://www.mayoclinic.org/diseases-conditions/mitral-valve-regurgitation/diagnosis-treatment/drc-203501832022-02-07T19:48:57-06:00https://www.mayoclinic.org/diseases-conditions/mitral-valve-regurgitation/symptoms-causes/syc-203501782022-02-07T19:49:12-06:00https://www.mayoclinic.org/diseases-conditions/thoracic-aortic-aneurysm/diagnosis-treatment/drc-203501932025-04-17T17:08:18-05:00https://www.mayoclinic.org/diseases-conditions/thoracic-aortic-aneurysm/symptoms-causes/syc-203501882025-04-17T17:07:59-05:00https://www.mayoclinic.org/diseases-conditions/thoracic-aortic-aneurysm/care-at-mayo-clinic/mac-203501972025-04-17T17:07:59-05:00https://www.mayoclinic.org/diseases-conditions/hypertrophic-cardiomyopathy/care-at-mayo-clinic/mac-203502082024-01-29T21:13:27-06:00https://www.mayoclinic.org/diseases-conditions/hypertrophic-cardiomyopathy/diagnosis-treatment/drc-203502042023-04-12T16:22:09-05:00
    """

    # Split the raw string into individual URLs. Your raw data is a single line,
    # so we split by 'https://' and then re-add it to each URL.
    test_urls = ["https://" + s for s in raw_url_data.strip().split("https://") if s]

    print(f"Processing {len(test_urls)} local URLs for testing...")

    # A list to hold our structured data
    url_data = []

    # Loop through each URL in our test list
    for original_url in test_urls:
        # --- URL Cleaning Logic ---
        # Use regex to find the base URL and remove the trailing timestamp.
        # This pattern looks for the part of the URL up to syc-12345, mac-12345, etc.
        match = re.search(r"(https://.*/(?:syc|mac|drc|art|faq)-\d+)", original_url)

        if not match:
            print(f"Skipping URL (pattern not found): {original_url}")
            continue  # Skip URLs that don't match our desired pattern

        clean_url = match.group(1)

        # --- Data Extraction Logic ---
        disease_name = None
        url_type = None

        # Extract disease name (the part after /diseases-conditions/)
        disease_match = re.search(r"/diseases-conditions/([^/]+)", clean_url)
        if disease_match:
            disease_name = disease_match.group(1)

        # Categorize the URL based on keywords
        if "symptoms-causes" in clean_url:
            url_type = "symptoms"
        elif "diagnosis-treatment" in clean_url:
            url_type = "diagnosis"
        elif "doctors-departments" in clean_url:
            url_type = "doctor_department"
        elif "care-at-mayo-clinic" in clean_url:
            url_type = "care_at_mayo_clinic"

        # Only add the data if we successfully extracted a disease name and type
        if disease_name and url_type:
            # Create a temporary dictionary to hold the data for the current URL
            temp_data_entry = {
                "disease_name": disease_name,
                "type": url_type,
                "url": clean_url,
            }
            # Append the temporary dictionary to our list
            url_data.append(temp_data_entry)

    if not url_data:
        print("No matching URLs were found or processed from the test data.")
        return

    print(f"Processed {len(url_data)} relevant URLs. Creating Excel file...")

    # --- Excel Export Logic ---
    # Convert the list of dictionaries to a pandas DataFrame
    df = pd.DataFrame(url_data)

    # Save the DataFrame to an Excel file
    output_filename = "mayoclinic_urls.xlsx"
    try:
        df.to_excel(output_filename, index=False, engine="openpyxl")
        print(f"Successfully created Excel file: {output_filename}")
    except Exception as e:
        print(f"Error saving to Excel file: {e}")


if __name__ == "__main__":
    # To run this script, you need to install the required libraries:
    # pip install pandas openpyxl
    clean_and_categorize_urls()
