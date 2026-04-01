#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_ACTIVATE="${ROOT_DIR}/tester/.venv/bin/activate"
SOL_DIR="${ROOT_DIR}/test/sol"
XML_DIR="${ROOT_DIR}/test/xml"
PARSER_DIR="${ROOT_DIR}/tester/sol2xml"
PARSER_SCRIPT="${PARSER_DIR}/sol_to_xml.py"

if [[ ! -f "${VENV_ACTIVATE}" ]]; then
  echo "ERROR: Virtual environment activation script not found: ${VENV_ACTIVATE}" >&2
  exit 1
fi

if [[ ! -f "${PARSER_SCRIPT}" ]]; then
  echo "ERROR: Parser script not found: ${PARSER_SCRIPT}" >&2
  exit 1
fi

if [[ ! -d "${SOL_DIR}" ]]; then
  echo "ERROR: Input directory not found: ${SOL_DIR}" >&2
  exit 1
fi

mkdir -p "${XML_DIR}"

# Activate the project's Python environment for sol2xml.
source "${VENV_ACTIVATE}"

shopt -s nullglob
sol_files=("${SOL_DIR}"/*.sol)

if (( ${#sol_files[@]} == 0 )); then
  echo "No .sol files found in ${SOL_DIR}"
  exit 0
fi

echo "Converting ${#sol_files[@]} file(s) from ${SOL_DIR} to ${XML_DIR}"

for sol_file in "${sol_files[@]}"; do
  base_name="$(basename "${sol_file}" .sol)"
  xml_file="${XML_DIR}/${base_name}.xml"

  (
    cd "${PARSER_DIR}"
    python "${PARSER_SCRIPT}" "${sol_file}" >"${xml_file}"
  )

  echo "OK: ${base_name}.sol -> ${base_name}.xml"
done

echo "Done. XML files are in ${XML_DIR}"