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

# Stage 2: Create a final lightweight image to hold the build artifacts.
# We use alpine as it's small but contains basic utilities needed by Docker Compose.
FROM alpine:latest

# Copy the build output from the builder stage into the final image.
# The volume mount in docker-compose will use this data.
COPY --from=builder /app/dist /app/dist