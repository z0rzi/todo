FROM node:18.0.0-alpine

# Adding dependencies to install node dependencies
RUN apk add python3 build-base

# Work to Dir
WORKDIR /app

# Copy Dir
COPY ./package.json /app/

# Install Node Packages
RUN yarn

COPY ./nodemon.json ./swagger.yaml ./tsconfig.json ./.swcrc /app/
COPY ./src /app/src

# Set Env
ENV NODE_ENV production

RUN yarn build

# Cmd script
CMD ["node", "/app/dist/server.js"]
