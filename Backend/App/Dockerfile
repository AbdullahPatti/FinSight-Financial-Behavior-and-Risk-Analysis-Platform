# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data (used in your NLP pipeline)
RUN python -m nltk.downloader punkt stopwords wordnet averaged_perceptron_tagger

# Copy all backend app files
COPY . .

# Create a directory for the SQLite database (persisted via volume)
RUN mkdir -p /app/data

# Expose the FastAPI port
EXPOSE 8000

# Run the app
CMD ["python", "run.py"]
