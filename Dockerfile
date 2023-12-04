FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002
EXPOSE 4003

CMD ["npm", "start"]