# Base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose backend port (default: 3000, you can change this)
EXPOSE 3000

# Start the production server with Node.js
CMD ["npm", "run", "start"]
