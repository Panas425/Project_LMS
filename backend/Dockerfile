# backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install nodemon for dev
RUN npm install -g nodemon

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Expose port
EXPOSE 5000

# Run server
CMD ["nodemon", "--legacy-watch", "./api/server.js"]
