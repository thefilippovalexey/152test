FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application code
COPY . .

# Create tmp directory for document generation
RUN mkdir -p /app/tmp && chmod 755 /app/tmp

EXPOSE 3000

CMD ["node", "server.js"]
