# Usa uma imagem Alpine (mais leve)
FROM node:18-alpine

# Instala apenas as bibliotecas essenciais do Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas package.json para otimizar cache
COPY package.json ./

# Instala as dependências do Node.js
RUN npm install

# Copia o restante do código do projeto
COPY . .

# Define a porta do servidor
EXPOSE 3000

# Comando de inicialização do servidor
CMD ["node", "server.js"]
