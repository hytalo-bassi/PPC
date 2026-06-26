FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install requests --break-system-packages

ENV VITE_HOST=0.0.0.0

WORKDIR /workspace

COPY package.json package-lock.json ./

RUN HUSKY=0 npm ci