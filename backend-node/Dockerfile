FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose Port
EXPOSE 8080

# Start Command
CMD ["npm", "start"]
