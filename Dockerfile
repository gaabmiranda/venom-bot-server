# Usa Alpine (mais leve, mas sem apt-get)
FROM node:18-alpine

# Instala os pacotes necessários para o Puppeteer e Chromium
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais para otimizar cache
COPY package.json ./

# Instala as dependências do Node.js
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código do projeto
COPY . .

# Define a porta do servidor
EXPOSE 3000

# Comando de inicialização do servidor
CMD ["node", "server.js"]
