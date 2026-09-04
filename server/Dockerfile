FROM node:20-bookworm

WORKDIR /app

# Required to compile sqlite3 inside the container
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies first for Docker layer caching
COPY package*.json ./

# Force sqlite3 to compile for this Docker environment
RUN npm install --build-from-source=sqlite3

# Copy application source
COPY . .

EXPOSE 5000

CMD ["npm", "start"]