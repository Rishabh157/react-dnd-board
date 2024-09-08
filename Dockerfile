# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire application to the container
COPY . .

# Specify the command to run your app when the container starts
CMD ["npm", "start"]
