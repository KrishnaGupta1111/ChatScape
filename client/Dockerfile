# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY client/ .

# Build the React app for production
RUN npm run build

# Install nginx
RUN apk add --no-cache nginx

# Copy the built app to nginx serving directory
RUN cp -r dist/* /var/www/localhost/htdocs/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 