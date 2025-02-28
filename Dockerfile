# Etapa de build: Usa uma imagem maior para instalar dependências
FROM node:18-bullseye AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --only=production

# Etapa final: Imagem mais leve
FROM node:18-alpine

# Instala apenas as dependências essenciais do Chromium no Alpine
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 3000
CMD ["node", "server.js"]
