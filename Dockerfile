FROM node:22-slim

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm run build

USER node

EXPOSE 3000

CMD ["npm", "start"]