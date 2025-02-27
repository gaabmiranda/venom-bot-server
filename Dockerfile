# Usa a imagem correta do Node.js com suporte a apt-get
FROM node:18-bullseye

# Evita travas interativas
ENV DEBIAN_FRONTEND=noninteractive

# 🛠️ Instala pacotes com debug ativado para ver erros
RUN apt-get update && apt-get install -y --no-install-recommends \
  libnss3 libxss1 libasound2 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libxcomposite1 libxdamage1 libxrandr2 \
  libgbm1 libpango-1.0-0 libpangocairo-1.0-0 \
  libxshmfence1 libxinerama1 libxfixes3 fonts-liberation \
  chromium chromium-driver \
  -o Debug::pkgProblemResolver=true \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*


# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos essenciais para otimizar cache
COPY package.json ./

# Instala dependências do Node.js
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia o restante do código do projeto
COPY . .

# Define a porta do servidor
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
