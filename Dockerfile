# Usar una imagen oficial de Node.js ligera
FROM node:22-alpine

# Crear directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto de la API
EXPOSE 3000

# Comando para iniciar la aplicación desde la carpeta compilada
CMD ["npm", "start"]
