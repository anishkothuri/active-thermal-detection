#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP_PATH="$ROOT_DIR/../TestAnimal.yolov8.zip"

if [ ! -f "$ZIP_PATH" ]; then
  echo "ERROR: TestAnimal.yolov8.zip not found at $ZIP_PATH"
  echo "Place the zip file in the parent directory (CattleThermalImageDetection/) and re-run."
  exit 1
fi

echo "Extracting dataset..."
unzip -o "$ZIP_PATH" -d "$ROOT_DIR/dataset/"
echo "Dataset extracted to dataset/"

echo ""
echo "Installing root dependencies (concurrently)..."
cd "$ROOT_DIR" && npm install

echo ""
echo "Installing server dependencies..."
cd "$ROOT_DIR/server" && npm install

echo ""
echo "Installing client dependencies..."
cd "$ROOT_DIR/client" && npm install

echo ""
echo "Installing Python dependencies..."
cd "$ROOT_DIR/ml"
python3 -m pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To start the entire app with one command:"
echo "  cd cattle-thermal-detection && npm start"
echo ""
echo "Then open http://localhost:5173"
