#! /bin/bash

DOCKER_NAME=docker # can be changed to docker

# building the image - this file needs to be in same folder as Container file
sudo ${DOCKER_NAME} build --target test --tag mytesttool .

NUMBER=1
REFERENCE_FILE=./student-tests/references/report
TEST_FILE=./student-tests/reports/report
CONTAINER_OUT=/opt/reports/report
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color (reset)

mkdir -p student-tests/reports

# running tests
sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -r -o "${CONTAINER_OUT}_1.json"

sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -o "${CONTAINER_OUT}_2.json"

sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -r -o "${CONTAINER_OUT}_3.json" --dry-run

# filtering tests
sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -r -o "${CONTAINER_OUT}_4.json" -i BLOCKS

sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -r -o "${CONTAINER_OUT}_5.json" -ic BLOCKS -e test_block_result

sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -r -o "${CONTAINER_OUT}_6.json" -it hello_world

sudo ${DOCKER_NAME} run --rm -v ./student-tests/tests:/opt/tests -v ./student-tests/reports:/opt/reports mytesttool \
    /opt/tests -r -o "${CONTAINER_OUT}_7.json" -i BLOCKS -et test_block_result

echo "---------------------------------------------------------------------"

# test check
while [ -f "${TEST_FILE}_${NUMBER}.json" ]; do
    if diff "${TEST_FILE}_${NUMBER}.json" "${REFERENCE_FILE}_${NUMBER}.json" > /dev/null; then
        echo -e "${NUMBER}. test passed [${GREEN}PASSED${NC}]"
    else
        echo -e "${NUMBER}. test failed [${RED}FAILED${NC}], see ${TEST_FILE}_${NUMBER}.json"
    fi
    ((NUMBER++))
done
