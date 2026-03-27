# 1. Use a lightweight Node.js environment
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first to leverage Docker caching
COPY package*.json ./

# 4. Install dependencies (ignoring local node_modules because of .dockerignore)
RUN npm install

# 5. Copy the rest of your service's code
COPY . .

# 6. Expose the port your patient-service runs on (assuming 5002)
EXPOSE 5002

# 7. Start the server
CMD ["npm", "run", "dev"]