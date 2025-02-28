# Usa a imagem Node.js baseada em Debian Slim
FROM node:18-bullseye-slim

# Define variáveis de ambiente para evitar o download do Chromium pelo Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Configura o apt para não ser interativo
ENV DEBIAN_FRONTEND=noninteractive

# Instala as dependências essenciais para o Chromium/Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  ca-certificates \
  fonts-liberation \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos essenciais do projeto
COPY package.json ./
# Instala as dependências do Node.js
RUN npm install --only=production

# Copia o restante do código do projeto
COPY . .

# Expõe a porta do servidor
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
