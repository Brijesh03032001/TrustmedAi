#!/usr/bin/env python3
"""
Streamlit URL Summarizer Web App using Ollama and LangChain

This web application provides a user-friendly interface to summarize URLs
using LLaMA 3.2 model through Ollama.

Requirements:
- Ollama installed and running with LLaMA 3.2 model
- Python packages: streamlit, langchain, langchain-ollama, langchain-community, langchain-core

Usage:
    streamlit run streamlit_url_summarizer.py
"""

import streamlit as st
from langchain_community.document_loaders import WebBaseLoader
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser


@st.cache_resource
def create_summarization_chain():
    """
    Creates a summarization chain using Ollama LLaMA 3.2 model.
    Cached to avoid recreating the chain on each run.

    Returns:
        LangChain chain for text summarization
    """
    try:
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
    except Exception as e:
        st.error(f"Error creating summarization chain: {str(e)}")
        return None


def load_webpage_content(url: str) -> tuple[str, str]:
    """
    Load and extract text content from a webpage.

    Args:
        url (str): The URL to load content from

    Returns:
        tuple: (content, error_message) - content is empty string if error occurred
    """
    try:
        # Use WebBaseLoader to fetch webpage content
        loader = WebBaseLoader(url)
        documents = loader.load()

        if not documents:
            return "", "No content could be extracted from the webpage"

        # Combine all document content (in case of multiple documents)
        content = "\n".join([doc.page_content for doc in documents])

        return content, ""

    except Exception as e:
        return "", f"Error loading webpage content: {str(e)}"


def summarize_url(url: str, chain) -> tuple[str, str]:
    """
    Summarize content from a given URL.

    Args:
        url (str): The URL to summarize
        chain: The LangChain summarization chain

    Returns:
        tuple: (summary, error_message) - summary is empty string if error occurred
    """
    try:
        # Load webpage content
        content, error = load_webpage_content(url)
        if error:
            return "", error

        # Limit content length to avoid token limits (roughly 10000 characters)
        max_content_length = 10000
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."
            st.info(
                f"Content truncated to {max_content_length} characters for processing"
            )

        # Generate summary
        summary = chain.invoke({"text": content})

        return summary.strip(), ""

    except Exception as e:
        return "", f"Error generating summary: {str(e)}"


def main():
    """Main Streamlit application."""

    # Set page config
    st.set_page_config(
        page_title="URL Summarizer",
        page_icon="📄",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    # Title and description
    st.title("🤖 URL Summarizer with LLaMA 3.2")
    st.markdown("### Powered by Ollama and LangChain")
    st.markdown("Enter a URL below to get an AI-generated summary of its content.")

    # Create summarization chain
    chain = create_summarization_chain()

    if chain is None:
        st.error(
            "Failed to initialize the summarization model. Please ensure Ollama is running with LLaMA 3.2 model."
        )
        st.markdown("**Setup Instructions:**")
        st.markdown("1. Install Ollama from [ollama.com](https://ollama.com)")
        st.markdown("2. Run `ollama run llama3.2` in your terminal")
        st.stop()

    # URL input
    url_input = st.text_input(
        "Enter URL:",
        placeholder="https://example.com",
        help="Enter the URL of the webpage you want to summarize",
    )

    # Columns for layout
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        summarize_button = st.button("🚀 Summarize", use_container_width=True)

    # Process URL when button is clicked or Enter is pressed
    if summarize_button and url_input:
        # Add protocol if missing
        if not url_input.startswith(("http://", "https://")):
            url_input = "https://" + url_input
            st.info(f"Added https:// protocol: {url_input}")

        # Show progress
        with st.spinner("Loading webpage content..."):
            # Create placeholders for updates
            status_placeholder = st.empty()

            status_placeholder.info("🌐 Fetching webpage content...")

            # Load content first to show character count
            content, error = load_webpage_content(url_input)

            if error:
                st.error(error)
                st.stop()

            status_placeholder.info(
                f"📝 Loaded {len(content)} characters. Generating summary..."
            )

            # Generate summary
            summary, error = summarize_url(url_input, chain)

            # Clear status
            status_placeholder.empty()

            if error:
                st.error(error)
            else:
                # Display results
                st.success("✅ Summary generated successfully!")

                # Show summary in a nice container
                st.markdown("## 📋 Summary")
                st.markdown("---")
                st.markdown(summary)
                st.markdown("---")

                # Show source URL
                st.markdown(f"**Source:** [{url_input}]({url_input})")

                # Option to copy summary
                st.text_area(
                    "Copy summary:",
                    value=summary,
                    height=200,
                    help="You can copy the summary from this text area",
                )

    elif summarize_button and not url_input:
        st.warning("Please enter a URL to summarize.")

    # Sidebar with information
    with st.sidebar:
        st.markdown("## ℹ️ About")
        st.markdown("""
        This application uses:
        - **LLaMA 3.2** for text generation
        - **Ollama** for local AI model serving
        - **LangChain** for AI workflow orchestration
        - **Streamlit** for the web interface
        """)

        st.markdown("## 🔧 Features")
        st.markdown("""
        - Extract content from any webpage
        - Generate concise summaries
        - Local AI processing (privacy-friendly)
        - No API keys required
        """)

        st.markdown("## 💡 Tips")
        st.markdown("""
        - Works with most public websites
        - Handles articles, blogs, news, documentation
        - Content is truncated to 4000 characters for optimal processing
        """)


if __name__ == "__main__":
    main()
