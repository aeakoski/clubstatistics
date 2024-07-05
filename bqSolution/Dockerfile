# Use an official Node.js runtime as a base image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Define environment variables
ENV MYWEBLOG_SYSTEM_USER=user_value
ENV MYWEBLOG_SYSTEM_PASSWORD=key_value
ENV MYWEBLOG_TOKEN=password_value

# Command to run your app
CMD ["node", "bqFiller.js"]
