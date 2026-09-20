FROM node:20

WORKDIR /opt/custodia

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando - generar Prisma client, ejecutar migraciones y luego iniciar dev
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]
