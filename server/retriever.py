import faiss
import openai
import numpy as np
from embedder import get_embeddings

def load_index():
    return faiss.read_index("index/faiss_index.bin")

def retrieve(query, docs, top_k=5):
    index = load_index()
    query_embedding = get_embeddings([query])[0]
    D, I = index.search(np.array([query_embedding]).astype("float32"), top_k)
    return [docs[i] for i in I[0]]
