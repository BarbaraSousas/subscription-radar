#!/bin/bash
set -e

echo "========================================="
echo "START: Checking environment"
echo "========================================="
echo "PORT: ${PORT:-NOT SET}"
echo "Python version: $(python3 --version)"
echo "Python3 path: $(which python3)"
echo "Pip3 path: $(which pip3)"
echo ""
echo "Checking for uvicorn..."
pip3 show uvicorn || echo "uvicorn package info not available"
echo "========================================="

# Try to run uvicorn directly first
if command -v uvicorn &> /dev/null; then
    echo "Using uvicorn command directly"
    exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
else
    echo "Uvicorn not in PATH, trying python3 -m uvicorn"
    exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
fi
