# Stage 1: Build the React application
FROM node:20-slim AS build

WORKDIR /usr/src/app

# Add build arguments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration if needed (optional)
# For SPA routing, we need to handle history mode
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
