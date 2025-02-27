# Usa a imagem oficial do Node.js
FROM node:18-bullseye

# Configura o ambiente para evitar prompts do apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Instala somente as dependências essenciais para o Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
  libnss3 libxss1 libasound2 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libxcomposite1 libxdamage1 libxrandr2 \
  libgbm1 libpango-1.0-0 libpangocairo-1.0-0 \
  libxshmfence1 libxinerama1 libxfixes3 fonts-liberation \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais primeiro (para cache otimizado)
COPY package.json ./

# Instala as dependências do Node.js
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código do projeto
COPY . .

# Define a porta do servidor
EXPOSE 3000

# Comando de inicialização do servidor
CMD ["node", "server.js"]
