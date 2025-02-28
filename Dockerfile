# Etapa de build: Usa uma imagem maior para instalar dependências
FROM node:18-bullseye AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia o package.json e instala as dependências de produção
COPY package.json ./
RUN npm install --only=production

# Copia todo o código do projeto (incluindo server.js)
COPY . .

# Etapa final: Imagem mais leve
FROM node:18-alpine

# Instala apenas as dependências essenciais para o Chromium no Alpine
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Define variáveis de ambiente para que o Puppeteer use o Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copia os arquivos do estágio de build
COPY --from=builder /app /app

EXPOSE 3000

# Comando de inicialização do servidor
CMD ["node", "server.js"]
