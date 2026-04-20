#!/bin/bash

LOGIN="xmicham00"
ARCHIVE="${LOGIN}.zip"

echo "Vytváram archív $ARCHIVE..."

# Odstránenie starého archívu, ak existuje
rm -f "$ARCHIVE"

# Zabalenie celého projektu s explicitným vylúčením nežiadúcich súborov a zložiek
zip -r "$ARCHIVE" Dockerfile int tester \
    -x "*/\.*" \
    -x "*/__pycache__/*" \
    -x "*.pyc" \
    -x "*.pyo" \
    -x "int/dist/*" \
    -x "tester/.venv/*" \
    -x "int/node_modules/*" \
    -x "tester/.ruff_cache/*" \
    -x "tester/.mypy_cache/*" 

cd docs
zip -u "../$ARCHIVE" dokumentace.pdf ai-github-copilot.md
cd ..

echo "Archív $ARCHIVE bol úspešne vytvorený."
echo "Spúšťam lokálnu kontrolu..."
./is_archive_ok.sh "$ARCHIVE"
