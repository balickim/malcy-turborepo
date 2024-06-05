# Use the official Node.js 22 image as a base
FROM node:22

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy .npmrc to handle peer dependencies
COPY .npmrc .npmrc

# Copy pnpm workspace file from the root context
COPY ../../pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy package.json and pnpm-lock.yaml from the root context
COPY ../../package.json ../../pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Install any required additional packages
RUN apt-get update && apt-get install -y --no-install-recommends curl wget

# Build the NestJS application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Default command to run the application
CMD ["pnpm", "start"]
