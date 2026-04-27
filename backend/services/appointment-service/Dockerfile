FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .


EXPOSE 5005

CMD ["node", "src/index.js"]

EXPOSE 5005
CMD ["npm", "run", "dev"]
