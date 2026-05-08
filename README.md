# Enhanced Medical URL Analyzer with LLaMA 3.2

A sophisticated Python application that analyzes medical webpage content using LLaMA 3.2 model through Ollama and LangChain. **NEW**: Now features specialized medical content analysis with structured JSON output!

## 🆕 New Features

- � **Intelligent Content Type Detection** - Automatically detects if URL contains symptoms, diagnosis, or treatment content
- 📋 **Specialized Medical Prompts** - Custom AI prompts for different medical content types
- 🔧 **Structured JSON Output** - Organized data extraction with key-value pairs
- 💾 **Automatic File Saving** - Save extracted medical data with metadata
- 📊 **Batch Processing** - Process multiple URLs from a file
- 🏥 **Medical-Focused Analysis** - Optimized for Mayo Clinic and similar medical websites

## Features

- 🌐 Extract content from medical webpages (Mayo Clinic, etc.)
- 🤖 Generate AI-powered structured analysis using LLaMA 3.2
- � **Smart Content Analysis**:
  - **Symptoms URLs**: Extract symptoms, causes, and prevention methods
  - **Diagnosis URLs**: Extract diagnostic tests, treatments, medications, procedures
  - **General URLs**: Extract key points and important information
- 💻 Multiple interfaces: Command-line, web UI (Streamlit), and batch processing
- 🔒 Local AI processing (privacy-friendly, no API keys required)
- ⚡ Fast and efficient with structured JSON output

## Prerequisites

### 1. Install Ollama

Download and install Ollama from [ollama.com](https://ollama.com)

### 2. Install LLaMA 3.2 Model

```bash
ollama run llama3.2
```

This will download and install the LLaMA 3.2 model (approximately 2GB).

### 3. Python Environment

Make sure you have Python 3.8+ installed.

## Installation

1. **Clone or download the project files**

2. **Create a virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

3. **Install required packages:**
```bash
pip install streamlit langchain langchain-ollama langchain-community langchain-core pymupdf beautifulsoup4 lxml
```

## Usage

### Enhanced Medical Analysis (NEW!)

**Analyze symptoms & causes:**
```bash
python url_summarizer.py https://www.mayoclinic.org/diseases-conditions/stroke/symptoms-causes/syc-20350113
```

**Save JSON automatically:**
```bash
python url_summarizer.py https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444 --save
```

**Batch process multiple URLs:**
```bash
python batch_analyzer.py urls.txt
```

### Command Line Interface

**Basic usage:**
```bash
python url_summarizer.py https://example.com
```

**Interactive mode:**
```bash
python url_summarizer.py
# Enter URL when prompted
```

### Web Interface (Streamlit)

**Start the web application:**
```bash
streamlit run streamlit_url_summarizer.py
```

Then open your browser to `http://localhost:8501`

### Batch Processing (NEW!)

**Process multiple URLs:**
1. Create a `urls.txt` file with URLs (one per line)
2. Run: `python batch_analyzer.py urls.txt`
3. Results saved in `batch_results/` directory

## Examples

### Enhanced Medical Analysis Examples

#### Symptoms & Causes Analysis
```bash
python url_summarizer.py https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444
```

**Structured JSON Output:**
```json
{
  "disease_name": "Diabetes",
  "symptoms": [
    "Feeling more thirsty than usual",
    "Urinating often", 
    "Losing weight without trying",
    "Feeling tired and weak"
  ],
  "causes": [
    "The pancreas not producing enough insulin",
    "The body's cells becoming resistant to insulin",
    "Genetics (family history)",
    "Obesity"
  ],
  "prevention": [
    "Maintaining a healthy weight through diet and exercise",
    "Eating a balanced diet that is low in sugar",
    "Engaging in regular physical activity"
  ],
  "summary": "Diabetes affects how the body uses blood sugar..."
}
```

#### Diagnosis & Treatment Analysis  
```bash
python url_summarizer.py https://www.mayoclinic.org/diseases-conditions/stroke/diagnosis-treatment/drc-20350113
```

**Structured JSON Output:**
```json
{
  "disease_name": "Stroke",
  "diagnostic_tests": ["CT scan", "MRI scan", "Carotid ultrasound"],
  "treatment_options": ["Thrombolysis", "Embolectomy", "Surgery"],
  "medications": ["Tissue plasminogen activator (tPA)", "Anticoagulants"],
  "procedures": ["Angioplasty", "Stenting", "Endarterectomy"],
  "summary": "Prompt treatment can reduce brain damage..."
}
```

### Command Line Example
```bash
python url_summarizer.py https://python.org
```

Output:
```
------------------------------------------------------------
URL SUMMARIZER
------------------------------------------------------------
Loading content from: https://python.org
Successfully loaded 7009 characters from the webpage
Content truncated to 4000 characters
Generating summary using LLaMA 3.2...

SUMMARY:
============================================================
Here is a concise summary of the provided text:

**Introduction**
* Welcome to Python.org, the official website for the Python programming language.
...
============================================================
```

### Web Interface
1. Open `http://localhost:8501` in your browser
2. Enter a URL in the text input field
3. Click "🚀 Summarize"
4. View the generated summary

## How It Works

1. **Web Content Extraction**: Uses `WebBaseLoader` from LangChain to fetch and extract text content from webpages
2. **Content Processing**: Truncates content to 4000 characters to optimize processing time
3. **AI Summarization**: Sends content to LLaMA 3.2 model via Ollama for summarization
4. **Output**: Returns a concise, comprehensive summary of the main points

## Features & Limitations

### ✅ Works Well With
- News articles
- Blog posts
- Documentation pages
- Wikipedia articles
- Most public websites

### ⚠️ Limitations
- Content is truncated to 4000 characters
- Requires websites to be publicly accessible
- JavaScript-heavy sites may not load completely
- Some sites may block automated requests

## Configuration

### Customizing the AI Model
Edit the `OllamaLLM` initialization in the scripts:

```python
llm = OllamaLLM(
    model="llama3.2",           # Change model here
    temperature=0.3,            # Adjust creativity (0.0-1.0)
)
```

### Adjusting Content Length
Modify the `max_content_length` variable:

```python
max_content_length = 4000  # Increase/decrease as needed
```

## File Structure

```
├── url_summarizer.py              # Enhanced medical analysis (main script)
├── streamlit_url_summarizer.py    # Web interface
├── batch_analyzer.py              # Batch processing script (NEW!)
├── urls.txt                       # Sample URLs for batch processing (NEW!)
├── test.py                       # Your original Mayo Clinic script
├── demo1.py                      # Your demo file
├── batch_results/                # Directory for batch processing results (NEW!)
├── *.json                        # Individual analysis results (NEW!)
├── venv/                         # Virtual environment
└── README.md                     # This file
```

## Troubleshooting

### Common Issues

**1. "No module named 'bs4'" error:**
```bash
pip install beautifulsoup4 lxml
```

**2. "Error creating summarization chain":**
- Ensure Ollama is running: `ollama serve`
- Verify LLaMA 3.2 is installed: `ollama list`

**3. "Import could not be resolved" warnings:**
- These are usually linting warnings and don't affect functionality
- Ensure you're using the virtual environment: `source venv/bin/activate`

**4. Web page loading errors:**
- Some sites block automated requests
- Try a different URL
- Check if the site is publicly accessible

### Checking Ollama Status

```bash
# Check if Ollama is running
ollama list

# Start Ollama service (if needed)
ollama serve

# Test LLaMA 3.2 model
ollama run llama3.2
```

## Privacy & Security

- ✅ All processing happens locally on your machine
- ✅ No data is sent to external APIs
- ✅ No API keys required
- ✅ Your summaries remain private

## Requirements

### Software
- Python 3.8+
- Ollama with LLaMA 3.2 model

### Python Packages
- streamlit
- langchain
- langchain-ollama
- langchain-community
- langchain-core
- pymupdf
- beautifulsoup4
- lxml

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

---

**Enjoy summarizing the web with AI! 🤖📄**