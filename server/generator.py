import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_response(query, context_chunks):
    context = "\n\n".join(context_chunks)
    prompt = f"""You are an assistant helping answer questions using provided information.
    
Context:
{context}

Question:
{query}

Answer:"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500
    )
    return response.choices[0].message.content
