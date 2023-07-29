# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:18.0.0-alpine AS builder
# Set working directory
WORKDIR /app
# Copy deps list
COPY ./package.json .
# install node modules
RUN yarn install

# Copy all files from current directory to working dir
COPY ./tsconfig.json /app/
COPY ./src /app/src
# install node modules and build assets
CMD ["yarn", "start"]
