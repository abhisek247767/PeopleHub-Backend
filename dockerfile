# Step 1: Use the official Node.js image as the base image
FROM node:23-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --frozen-lockfile

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
