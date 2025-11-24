FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN chmod +x seed.js
EXPOSE 3000
CMD ["node", "server.js"]
