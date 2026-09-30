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

# Ensure babel config exists (if not, add it)
# Optionally copy babel config if external
# COPY .babelrc .babelrc

# Expose backend port (default: 3000, you can change this)
EXPOSE 3000

# Start app in dev mode using nodemon and babel-node
CMD ["npm", "run", "start"]
