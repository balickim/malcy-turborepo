FROM node:22

WORKDIR /app

# Copy .npmrc to handle peer dependencies
COPY .npmrc .npmrc

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Install any required additional packages
RUN apt-get update && apt-get install -y --no-install-recommends curl wget

# Build the NestJS application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8000

# Default command to run the application
CMD ["npm", "start"]
