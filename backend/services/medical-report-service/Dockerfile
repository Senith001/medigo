FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads/reports
EXPOSE 5006
CMD ["node", "src/server.js"]
