# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# map to port 3000 
EXPOSE 3000

# Define the command to run your app using CMD.
CMD [ "node", "src/server.js" ]
