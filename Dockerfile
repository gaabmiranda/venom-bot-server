# Usa a imagem Node.js baseada em Alpine, que é muito mais leve
FROM node:18-alpine

# Define a variável de ambiente para o Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser

# Instala as dependências essenciais para rodar o Chromium/Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json (e, se existir, o package-lock.json)
COPY package.json ./
# Se houver package-lock.json, o comando abaixo pode ser usado:
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código do projeto
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
