import os
import sys
import pytest
import io
import json
import logging
from unittest.mock import patch, MagicMock

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api import app, initialize_rag

# Get the logger
logger = logging.getLogger('pytest_logger')

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        logging.info("Test client initialized")
        yield client

@pytest.fixture
def mock_rag():
    with patch('api.build_index') as mock_build, \
         patch('api.retrieve') as mock_retrieve, \
         patch('api.generate_response') as mock_generate:
        mock_build.return_value = (["test doc"], ["test.txt"])
        mock_retrieve.return_value = ["relevant chunk"]
        mock_generate.return_value = "test response"
        logging.info("RAG components mocked")
        yield (mock_build, mock_retrieve, mock_generate)

class TestFileUpload:
    def test_upload_valid_txt_file(self, client):
        logger.info("Starting valid file upload test")
        data = {'file': (io.BytesIO(b'This is a test file content'), 'test.txt')}
        response = client.post('/upload', 
                             content_type='multipart/form-data',
                             data=data)
        
        logger.info(f"Upload response status: {response.status_code}")
        assert response.status_code == 201
        assert 'test.txt' in response.json['filename']
        
        # Clean up
        os.remove(os.path.join('data/docs', 'test.txt'))
        logger.info("Valid file upload test completed")

    def test_upload_invalid_file_type(self, client):
        logging.info("Testing invalid file type upload")
        data = {'file': (io.BytesIO(b'PDF content'), 'test.pdf')}
        response = client.post('/upload',
                             content_type='multipart/form-data',
                             data=data)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert 'File type not allowed' in response.json['error']
        logging.info("Invalid file type test completed")

    def test_upload_no_file(self, client):
        response = client.post('/upload')
        assert response.status_code == 400
        assert 'No file part in the request' in response.json['error']

    def test_upload_empty_filename(self, client):
        data = {'file': (io.BytesIO(b''), '')}
        response = client.post('/upload',
                             content_type='multipart/form-data',
                             data=data)
        
        assert response.status_code == 400
        assert 'No file selected' in response.json['error']

    def test_upload_large_file(self, client):
        # Create a file larger than 10MB
        large_content = b'x' * (10 * 1024 * 1024 + 1)
        data = {'file': (io.BytesIO(large_content), 'large.txt')}
        
        response = client.post('/upload',
                             content_type='multipart/form-data',
                             data=data)
        
        assert response.status_code == 400
        assert 'File size exceeds' in response.json['error']

    def test_upload_duplicate_file(self, client):
        logger.info("Starting duplicate file upload test")
        # First upload
        first_data = {'file': (io.BytesIO(b'content'), 'duplicate.txt')}
        first_response = client.post('/upload', 
                                   content_type='multipart/form-data',
                                   data=first_data)
        
        logger.info(f"First upload status: {first_response.status_code}")
        
        # Second upload
        second_data = {'file': (io.BytesIO(b'content'), 'duplicate.txt')}
        second_response = client.post('/upload',
                                    content_type='multipart/form-data',
                                    data=second_data)
        
        logger.info(f"Second upload status: {second_response.status_code}")
        
        assert second_response.status_code == 409
        assert 'File already exists' in second_response.json['error']
        
        # Clean up
        try:
            os.remove(os.path.join('data/docs', 'duplicate.txt'))
            logger.info("Test file cleaned up")
        except OSError as e:
            logger.error(f"Error cleaning up test file: {str(e)}")

class TestQueryEndpoint:
    def test_valid_query(self, client, mock_rag):
        logging.info("Testing valid query")
        response = client.post('/query',
                             json={'query': 'test question'},
                             content_type='application/json')
        
        assert response.status_code == 200
        assert 'response' in response.json
        assert 'sources' in response.json
        logging.info("Valid query test completed")

    def test_missing_query(self, client):
        response = client.post('/query',
                             json={},
                             content_type='application/json')
        
        assert response.status_code == 400
        assert 'No query provided' in response.json['error']

    def test_empty_query(self, client):
        response = client.post('/query',
                             json={'query': ''},
                             content_type='application/json')
        
        assert response.status_code == 400
        assert 'Query cannot be empty' in response.json['error']

    def test_query_too_short(self, client):
        response = client.post('/query',
                             json={'query': 'ab'},
                             content_type='application/json')
        
        assert response.status_code == 400
        assert 'Query must be at least' in response.json['error']

    def test_query_too_long(self, client):
        long_query = 'x' * 1001
        response = client.post('/query',
                             json={'query': long_query},
                             content_type='application/json')
        
        assert response.status_code == 400
        assert 'Query cannot exceed' in response.json['error']

    def test_invalid_content_type(self, client):
        response = client.post('/query',
                             data='test question',
                             content_type='text/plain')
        
        assert response.status_code == 400
        assert 'Request must be JSON' in response.json['error']

    def test_rag_not_initialized(self, client):
        with patch('api.docs', None), patch('api.sources', None), \
             patch('api.initialize_rag', return_value=False):
            response = client.post('/query',
                                 json={'query': 'test question'},
                                 content_type='application/json')
            
            assert response.status_code == 500
            assert 'RAG system not initialized' in response.json['error']

    def test_no_relevant_documents(self, client):
        with patch('api.retrieve', return_value=[]):
            response = client.post('/query',
                                 json={'query': 'test question'},
                                 content_type='application/json')
            
            assert response.status_code == 404
            assert 'No relevant information found' in response.json['response']

    def test_general_error_handling(self, client):
        logging.info("Testing general error handling")
        with patch('api.retrieve', side_effect=Exception("Test error")):
            response = client.post('/query',
                                 json={'query': 'test question'},
                                 content_type='application/json')
            
            assert response.status_code == 500
            assert 'An error occurred while processing your query' in response.json['error']
            logging.info("General error handling test completed")

    def test_indexing_error(self, client):
        """Test handling of indexing errors"""
        with patch('api.initialize_rag', return_value=False), \
             patch('api.docs', None), \
             patch('api.sources', None):
            response = client.post('/query',
                                 json={'query': 'test question'},
                                 content_type='application/json')
            
            assert response.status_code == 500
            assert 'RAG system not initialized' in response.json['error']
            logging.info("Indexing error test completed") 