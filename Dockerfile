# Usa a imagem oficial do Node.js
FROM node:18-bullseye

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
