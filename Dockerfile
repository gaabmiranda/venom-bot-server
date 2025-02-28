# Usa a imagem Node.js baseada em Alpine, que é muito mais leve
FROM node:18-alpine

# Define a variável de ambiente para o Chromium (ajuste o caminho se necessário)
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

# Copia o package.json para otimizar o cache
COPY package.json ./

# Instala as dependências do Node.js.
# Se houver um package-lock.json, ele usará 'npm ci', caso contrário 'npm install'
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código do projeto
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
