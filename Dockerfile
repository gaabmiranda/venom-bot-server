# Usa a imagem Node.js baseada em Alpine, que é mais leve e não utiliza apt-get
FROM node:18-alpine

# Instala as dependências essenciais para o Chromium/Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Define a variável de ambiente para que o Puppeteer saiba onde encontrar o Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json (e, se existir, o package-lock.json)
COPY package.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código do projeto
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
