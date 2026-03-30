#!/usr/bin/env bash
set -euo pipefail

source /opt/tester/.venv/bin/activate
exec python src/tester.py "$@"
