from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from embedder import build_index
from retriever import retrieve
from generator import generate_response
from typing import Tuple, Dict, Union, List
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'data/docs'
ALLOWED_EXTENSIONS = {'txt'}
MAX_QUERY_LENGTH = 1000  # Maximum query length in characters
MIN_QUERY_LENGTH = 3     # Minimum query length in characters

# Global variables for RAG
docs = None
sources = None

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def initialize_rag() -> bool:
    """Initialize or refresh the RAG index"""
    global docs, sources
    try:
        if not os.path.exists(UPLOAD_FOLDER) or not os.listdir(UPLOAD_FOLDER):
            logger.warning("No documents found in upload folder")
            return False
        
        docs, sources = build_index()
        logger.info("RAG system initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing RAG: {str(e)}")
        return False

def validate_query(query: str) -> Tuple[bool, str]:
    """Validate query parameters"""
    if not query:
        return False, "Query cannot be empty"
    if len(query) < MIN_QUERY_LENGTH:
        return False, f"Query must be at least {MIN_QUERY_LENGTH} characters long"
    if len(query) > MAX_QUERY_LENGTH:
        return False, f"Query cannot exceed {MAX_QUERY_LENGTH} characters"
    return True, ""

@app.route('/upload', methods=['POST'])
def upload_file() -> Tuple[Dict[str, str], int]:
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Only .txt files are accepted'}), 400
        
        if len(file.read()) > 10 * 1024 * 1024:  # 10MB in bytes
            return jsonify({'error': 'File size exceeds 10MB limit'}), 400
        file.seek(0)
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if os.path.exists(filepath):
            return jsonify({'error': 'File already exists'}), 409
        
        file.save(filepath)
        
        if initialize_rag():
            logger.info(f"File {filename} uploaded and indexed successfully")
            return jsonify({
                'message': 'File uploaded successfully and indexed',
                'filename': filename
            }), 201
        else:
            os.remove(filepath)
            return jsonify({'error': 'File uploaded but indexing failed'}), 500
            
    except Exception as e:
        logger.error(f"Error during file upload: {str(e)}")
        return jsonify({'error': 'An error occurred during file upload'}), 500

@app.route('/query', methods=['POST'])
def query_rag() -> Tuple[Dict[str, Union[str, List[str]]], int]:
    try:
        # Check if RAG system is initialized
        global docs, sources
        if docs is None or sources is None:
            if not initialize_rag():
                return jsonify({'error': 'RAG system not initialized'}), 500

        # Validate request format
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400

        # Get query from request
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400

        query = data['query']
        
        # Validate query
        is_valid, error_message = validate_query(query)
        if not is_valid:
            return jsonify({'error': error_message}), 400

        # Get relevant document chunks
        top_chunks = retrieve(query, docs)
        if not top_chunks:
            return jsonify({
                'response': 'No relevant information found',
                'sources': []
            }), 404
        
        # Generate response
        response = generate_response(query, top_chunks)
        
        return jsonify({
            'response': response,
            'sources': sources[:len(top_chunks)]
        }), 200

    except Exception as e:
        logger.error(f"Error during query: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your query'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 