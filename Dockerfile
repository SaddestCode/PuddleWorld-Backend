FROM node:latest

RUN npm install -g prisma
RUN npm install -g prisma-multischema

COPY .env ./
COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma-multischema
RUN npx prisma generate
RUN npm run build