import warnings
import urllib3.exceptions
warnings.filterwarnings("ignore", category=urllib3.exceptions.NotOpenSSLWarning)

from embedder import build_index
from retriever import retrieve
from generator import generate_response

# Step 1: Index documents (only run once or when documents change)
docs, sources = build_index()

# Step 2: Ask a question
query = input("Enter your question: ")
top_chunks = retrieve(query, docs)

# Step 3: Get answer from GPT
response = generate_response(query, top_chunks)
print("\nGenerated Answer:\n", response)
