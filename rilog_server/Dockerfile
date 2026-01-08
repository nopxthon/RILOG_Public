FROM node:18-alpine
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Copy semua codingan
COPY . .

# Expose port backend (biasanya 5000)
EXPOSE 5000

# Perintah jalanin backend (sesuaikan script di package.json)
CMD ["npm", "run", "dev"]