# Use uma imagem base com a versão recomendada do Node
FROM node:18.17.0

# Instale as dependências do sistema necessárias para o Chromium rodar corretamente
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
  && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copie os arquivos de configuração e instale as dependências do projeto
COPY package*.json ./
RUN npm install

# Copie o restante do código para a imagem
COPY . .

# Defina a variável de ambiente (opcional)
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "index.js"]
