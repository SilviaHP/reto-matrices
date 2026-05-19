# Imagen base ligera de Node.js
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar manifiestos e instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el resto del código fuente
COPY . .

# Puerto expuesto (debe coincidir con PORT en .env)
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
