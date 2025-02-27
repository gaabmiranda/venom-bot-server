# Usa uma versão mais leve do Node.js
FROM node:18-bullseye

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais para evitar reinstalações desnecessárias
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install --only=production

# Copia todo o código do projeto para dentro do contêiner
COPY . .

# Define o comando que será executado quando o contêiner iniciar
CMD ["node", "server.js"]
