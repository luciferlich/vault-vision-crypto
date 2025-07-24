# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy dependencies file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy your backend code into the container
COPY . .

# Expose port FastAPI will run on
EXPOSE 8000

# Start FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
