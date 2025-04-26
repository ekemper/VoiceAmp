import os
import faiss
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI
from unstructured.partition.auto import partition

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_embeddings(texts):
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=texts
    )
    return [e.embedding for e in response.data]

def build_index(doc_folder="data/docs/"):
    documents, sources = [], []
    for file in os.listdir(doc_folder):
        filepath = os.path.join(doc_folder, file)
        elements = partition(filename=filepath)
        for el in elements:
            if el.text:
                documents.append(el.text)
                sources.append(file)

    embeddings = get_embeddings(documents)
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype('float32'))

    faiss.write_index(index, "index/faiss_index.bin")
    return documents, sources
