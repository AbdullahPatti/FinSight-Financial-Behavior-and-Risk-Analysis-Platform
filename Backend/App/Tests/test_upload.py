import pytest
from unittest.mock import patch

def test_upload_invalid_file_type(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Try uploading a text file instead of CSV
    files = {"file": ("test.txt", b"dummy content", "text/plain")}
    response = client.post("/upload/", headers=headers, files=files)
    
    assert response.status_code == 200 
    assert response.json().get("error") == "Only CSV files are allowed"

@patch("App.Routers.upload.run_full_pipeline")
@patch("App.Routers.upload.bulk_insert_transactions")
@patch("App.Routers.upload.bulk_insert_quarterly")
def test_upload_valid_csv(mock_insert_quarterly, mock_insert_transactions, mock_pipeline, client, auth_token):
    # Setup mocks to pretend pipeline succeeds
    mock_pipeline.return_value = True
    mock_insert_transactions.return_value = True
    mock_insert_quarterly.return_value = True

    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Create simple valid dummy CSV content
    csv_content = b"transaction_id,amount_pkr\n1,100"
    files = {"file": ("test_data.csv", csv_content, "text/csv")}
    
    response = client.post("/upload/", headers=headers, files=files)
    
    assert response.status_code == 200 
    data = response.json()
    assert data.get("status") == "success"
    assert data.get("message") == "File uploaded and processed successfully"
    
    # Ensure our mocks were called
    mock_pipeline.assert_called_once()
    mock_insert_transactions.assert_called_once()
    mock_insert_quarterly.assert_called_once()

@patch("App.Routers.upload.run_full_pipeline")
def test_upload_pipeline_failure(mock_pipeline, client, auth_token):
    # Setup mock to pretend pipeline fails
    mock_pipeline.return_value = False

    headers = {"Authorization": f"Bearer {auth_token}"}
    files = {"file": ("test_failure.csv", b"dummy,csv", "text/csv")}
    
    response = client.post("/upload/", headers=headers, files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "error" in data
    assert "Pipeline processing failed" in data["error"]
