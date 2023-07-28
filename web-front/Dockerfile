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
COPY ./config-overrides.js ./tsconfig.json /app/
COPY ./public /app/public
COPY ./src /app/src
# install node modules and build assets
RUN yarn build

# nginx state for serving content
FROM nginx:alpine
# Set working directory to nginx asset directory
WORKDIR /html
# Copy NGINX configuration file
COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /app/build .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
