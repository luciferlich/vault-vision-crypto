#!/bin/bash
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Starting FastAPI server..."
python run.py