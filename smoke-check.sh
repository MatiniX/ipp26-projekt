#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BUILD_TAG="sol26-smoke-build"
RUNTIME_TAG="sol26-smoke-runtime"
TEST_TAG="sol26-smoke-test"

echo "[smoke] Building build stage image (${BUILD_TAG})"
docker build --target build --tag "${BUILD_TAG}" "${ROOT_DIR}"

echo "[smoke] Building runtime stage image (${RUNTIME_TAG})"
docker build --target runtime --tag "${RUNTIME_TAG}" "${ROOT_DIR}"

echo "[smoke] Runtime smoke run on sample XML"
docker run --rm \
  -v "${ROOT_DIR}/sol2xml/xml:/opt/xml:ro" \
  "${RUNTIME_TAG}" \
  --source /opt/xml/example.xml

echo "[smoke] Building test stage image (${TEST_TAG})"
docker build --target test --tag "${TEST_TAG}" "${ROOT_DIR}"

echo "[smoke] Test-tool smoke run (format aligned with assignment example)"
docker run --rm \
  -v "${ROOT_DIR}/tester/tests:/opt/tests" \
  "${TEST_TAG}" \
  -r -o /opt/tests/report.smoke.json -ic BASIC -et aaa -et bbb /opt/tests

if [[ ! -f "${ROOT_DIR}/tester/tests/report.smoke.json" ]]; then
  echo "[smoke] ERROR: report.smoke.json was not created" >&2
  exit 1
fi

echo "[smoke] OK"
echo "[smoke] Report: ${ROOT_DIR}/tester/tests/report.smoke.json"
