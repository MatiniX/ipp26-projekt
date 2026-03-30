# ==============================================================================
# Stage: check
# Prostredie pre nastroje na kontrolu kvality kodu (ESLint, Prettier, Ruff, Mypy)
# Pouzitie:
#   docker build --target check --tag sol26-check .
#   docker run --rm -it \
#     -v ./int:/src/int \
#     -v ./tester:/src/tester \
#     sol26-check
# ==============================================================================
FROM node:24-slim AS check

# Instalacia Pythonu a zakladnych nastrojov
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        bash \
    && rm -rf /var/lib/apt/lists/*

# Pre-instalacia Node.js zavislosti pre interpret (eslint, prettier, typescript, ...)
WORKDIR /opt/int
COPY int/package.json int/package-lock.json* ./
RUN npm install

# Pre-instalacia Python dev zavislosti pre tester (ruff, mypy)
COPY tester/requirements.txt tester/requirements-dev.txt /opt/tester/
RUN pip install --break-system-packages \
    -r /opt/tester/requirements.txt \
    -r /opt/tester/requirements-dev.txt

WORKDIR /src
ENTRYPOINT ["/bin/bash"]

# ==============================================================================
# Stage: build
# Preklad TypeScript zdrojoveho kodu interpretu
# Pouzitie:
#   docker build --target build --tag sol26-build .
# ==============================================================================
FROM node:24-slim AS build

WORKDIR /app

# Instalacia zavislosti
COPY int/package.json int/package-lock.json* ./
RUN npm install

# Kopirovanie zdrojoveho kodu a kompilacia
COPY int/tsconfig.json ./
COPY int/src/ ./src/
RUN npm run build

# ==============================================================================
# Stage: runtime
# Odlahceny obraz pre spustenie interpretu
# Pouzitie:
#   docker build --target runtime --tag sol26-runtime .
#   docker run --rm sol26-runtime --source /path/to/program.xml
# ==============================================================================
FROM node:24-slim AS runtime

WORKDIR /app

# Len production zavislosti (fast-xml-parser)
COPY int/package.json int/package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

# Skopirovanie prelozenych JS suborov z build stage
COPY --from=build /app/dist/ ./dist/

ENTRYPOINT ["node", "dist/solint.js"]

# ==============================================================================
# Stage: test
# Integracne testovanie - vychadzajuce z runtime, pridava Python tester a sol2xml
# Pouzitie:
#   docker build --target test --tag sol26-test .
#   docker run --rm -v ./testdata:/opt/tests sol26-test \
#     -r -o /opt/tests/report.json /opt/tests
# ==============================================================================
FROM runtime AS test

# Instalacia Pythonu, diff a zakladnych nastrojov
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        diffutils \
        bash \
    && rm -rf /var/lib/apt/lists/*

# Vytvorenie virtualneho prostredia pre tester
RUN python3 -m venv /opt/tester/.venv

# Instalacia Python zavislosti pre tester (pydantic)
COPY tester/requirements.txt /opt/tester/
RUN /opt/tester/.venv/bin/pip install -r /opt/tester/requirements.txt

# Kopirovanie zdrojoveho kodu testera
COPY tester/src/ /opt/tester/src/

# Instalacia sol2xml prekladaca a jeho zavislosti
COPY sol2xml/requirements.txt /opt/sol2xml/
RUN /opt/tester/.venv/bin/pip install -r /opt/sol2xml/requirements.txt
COPY sol2xml/sol_to_xml.py /opt/sol2xml/

# Entry point aktivuje virtualne prostredie a spusti tester.
COPY tester/docker-entrypoint.sh /opt/tester/docker-entrypoint.sh
RUN chmod +x /opt/tester/docker-entrypoint.sh

# Tester hlada parser/interpreter cez premenne prostredia.
# Tieto cesty su kompatibilne s layoutom image a CLI prikladom zo zadania.
ENV SOL2XML_PATH=/opt/sol2xml/sol_to_xml.py
ENV SOLINT_PATH=/app/dist/solint.js

WORKDIR /opt/tester

ENTRYPOINT ["/opt/tester/docker-entrypoint.sh"]
