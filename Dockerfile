# Dockerfile
FROM node:latest

RUN npm install -g prisma

COPY package*.json ./
RUN npm install

COPY . .

RUN npx tsc

RUN npx prisma-multischema
RUN npx prisma generate

CMD ["npm", "start"]