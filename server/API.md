# RAG Starter API Documentation

## Overview
This API provides endpoints for uploading documents to be processed by the RAG (Retrieval-Augmented Generation) system.

## Setup and Running the API

### Installation
1. Clone the repository and navigate to the project directory

2. Create and activate a virtual environment (recommended):
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the API

#### Production Mode
Start the API server normally:
```bash
python api.py
```

#### Development Mode (with Hot Reload)
For local development with automatic reloading on file changes:

1. Install development dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
python run_dev.py
```

Features of development mode:
- Automatic server restart when Python files change
- Debug mode enabled
- Detailed error pages
- Real-time code reloading

The server will start on `http://localhost:5001` and automatically restart when you make changes to any Python file in the project.

### Environment Variables
No environment variables are required for basic file upload functionality. However, if you plan to use the RAG features, you'll need:
- `OPENAI_API_KEY`: Your OpenAI API key

### Directory Structure
The API will automatically create required directories:
- `data/docs/`: Where uploaded text files are stored

### Health Check
Once the server is running, you can verify it's working by:
1. Opening a browser to `http://localhost:5001`
2. Using curl:
```bash
curl http://localhost:5001/upload
```
You should receive a 400 response indicating the endpoint is working but requires a file upload.

## Base URL

## Endpoints

### Upload Document
Upload a text file to be processed by the RAG system.

**URL**: `/upload`
**Method**: `POST`
**Content-Type**: `multipart/form-data`

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Text file to upload (.txt only) |

#### Responses

##### Success Response
**Code**: `201 CREATED`
```json
{
    "message": "File uploaded successfully",
    "filename": "example.txt"
}
```

##### Error Responses
**Code**: `400 BAD REQUEST`
```json
{
    "error": "No file part in the request"
}
```
OR
```json
{
    "error": "No file selected"
}
```
OR
```json
{
    "error": "File type not allowed. Only .txt files are accepted"
}
```

**Code**: `500 INTERNAL SERVER ERROR`
```json
{
    "error": "Error saving file: [error details]"
}
```

## Example Usage

### Using cURL
```bash
curl -X POST -F "file=@/path/to/your/document.txt" http://localhost:5001/upload
```

### Using Python Requests
```python
import requests

url = 'http://localhost:5001/upload'
files = {'file': open('document.txt', 'rb')}
response = requests.post(url, files=files)
print(response.json())
```

### Query RAG System
Query the RAG system with a question to get an AI-generated response based on the uploaded documents.

**URL**: `/query`
**Method**: `POST`
**Content-Type**: `application/json`

#### Request Body
```json
{
    "query": "Your question here"
}
```

#### Responses

##### Success Response
**Code**: `200 OK`
```json
{
    "response": "AI-generated answer to your question",
    "sources": ["document1.txt", "document2.txt"]  // Source documents used for the response
}
```

##### Error Responses
**Code**: `400 BAD REQUEST`
```json
{
    "error": "No query provided"
}
```

**Code**: `500 INTERNAL SERVER ERROR`
```json
{
    "error": "RAG system not initialized properly"
}
```
OR
```json
{
    "error": "Error processing query: [error details]"
}
```

### Example Usage

1. Upload a document:
```bash
curl -X POST -F "file=@document.txt" http://localhost:5001/upload
```

2. Query the system:
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"query":"What is the main topic of the document?"}' \
     http://localhost:5001/query
```

Using Python:
```python
import requests

# Upload document
files = {'file': open('document.txt', 'rb')}
upload_response = requests.post('http://localhost:5001/upload', files=files)

# Query the system
query = {'query': 'What is the main topic of the document?'}
query_response = requests.post('http://localhost:5001/query', json=query)
print(query_response.json())
```

The new implementation:
1. Automatically initializes the RAG system on startup
2. Reindexes documents when new files are uploaded
3. Provides detailed error messages
4. Returns both the response and the source documents used
5. Maintains proper state management for the RAG system

Would you like me to:
1. Add more error handling?
2. Add rate limiting?
3. Add caching for frequent queries?
4. Add any other features to the API?

## Running Tests

### Prerequisites
Ensure you have the test dependencies installed:
```bash
pip install pytest
```

### Running the Test Suite
To run the tests with clean output:
```bash
pytest tests/test_api.py -v --disable-warnings > tests/last_test_run.log 2>&1
```

This command:
- Runs all tests in verbose mode (`-v`)
- Suppresses all warning messages (`--disable-warnings`)
- Saves complete output to `tests/last_test_run.log`
- Captures both standard output and errors (`2>&1`)

### Reviewing Test Results
- Tests will run with real-time output in your terminal
- Complete test output, including any errors, will be saved in `tests/last_test_run.log`
- The log file is useful for debugging and documentation purposes

## Error Handling
- The API only accepts .txt files
- Filenames are sanitized for security
- Empty files or missing files will be rejected
- Server errors during file saving will return appropriate error messages

## Security Considerations
- Filenames are sanitized to prevent directory traversal attacks
- File types are strictly validated
- Upload directory is automatically created if it doesn't exist 