# File: rilog-frontend/Dockerfile

FROM node:18-alpine
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Copy semua codingan
COPY . .

# Expose port frontend (biasanya 3000)
EXPOSE 3000

# Perintah jalanin frontend
CMD ["npm", "run", "dev"]