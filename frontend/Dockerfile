FROM node:20-alpine

WORKDIR /usr/src/app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate prisma client
RUN npx prisma generate

EXPOSE 3000

# Run dev server (build will happen at runtime)
CMD ["npm", "run", "dev"]
