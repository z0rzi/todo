FROM node:18.0.0-alpine

RUN mkdir /app
WORKDIR /app

COPY ./package.json /app/package.json
RUN npm install --only=prod

COPY ./dist /app/dist
COPY ./assets /app/assets
COPY ./.env /app/.env

CMD ["node", "./dist/index.js"]
