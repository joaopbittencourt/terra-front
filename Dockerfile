# Multi-stage Dockerfile for building and serving the Angular app with nginx

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies based on package-lock if present (use npm ci for reproducible builds)
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# Copy source and build
COPY . .
# Build production bundle
RUN npm run build -- --configuration=production

# 2) Serve stage
FROM nginx:stable-alpine AS runtime

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder. Angular output goes to dist/<projectName>
COPY --from=build /app/dist/Terra /usr/share/nginx/html

# Copy custom nginx config to enable SPA fallback routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
