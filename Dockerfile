# Usa a versão oficial do Node.js 20 (LTS)
FROM node:20-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração do projeto
COPY package*.json ./

# Instala todas as dependências do projeto
RUN npm install

# Copia todo o código do projeto para o container
COPY . .

# Expõe a porta que o Render vai usar
ENV PORT=10000
EXPOSE 10000

# Comando para iniciar o servidor
CMD ["node", "src/main.js"]
