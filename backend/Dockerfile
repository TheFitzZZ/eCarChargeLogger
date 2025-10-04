FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --verbose

COPY . .

RUN mkdir -p /app/database

EXPOSE 3001

CMD ["npm", "start"]
