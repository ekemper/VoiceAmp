# RAG Starter Application

A Retrieval-Augmented Generation (RAG) application that allows you to query documents using natural language, powered by OpenAI's embeddings and GPT models.

## Overview

This application implements a RAG system that:
1. Indexes your documents using OpenAI's embeddings
2. Retrieves relevant context based on user queries
3. Generates accurate responses using GPT-4 with the retrieved context

## Features

- Document indexing using OpenAI's text-embedding-ada-002 model
- Semantic search using FAISS (Facebook AI Similarity Search)
- Context-aware responses using GPT-4
- Support for multiple document formats through unstructured-io
- Vector similarity search for accurate information retrieval

## Prerequisites

- Python 3.9+
- OpenAI API key
- Virtual environment (recommended)

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd rag-starter
```

2. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up your environment variables:
```bash
cp example.env .env
```
Then edit `.env` and add your OpenAI API key:
