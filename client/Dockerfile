# Use Node.js 18 as the base image
# Stage 1: Build the React application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
# The build context is ./client, so this copies ./client/package*.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client source code
COPY . .

# Build the application, the output will be in /app/dist
RUN npm run build

# Stage 2: Create a final lightweight image with only the build artifacts.
# This is just to hold the files; it won't be run directly.
FROM scratch

# Copy the build output from the builder stage
COPY --from=builder /app/dist /app/dist