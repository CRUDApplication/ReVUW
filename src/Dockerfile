# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# If building for production, you might want to run:
# RUN npm ci --only=production

# Copy the rest of the application code into the container
COPY . .

# Your app binds to port 3000, so use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Set necessary environment variables (these should ideally be set during container run and not build)
# ENV MONGODB_URI your_mongodb_uri
# ENV SESSION_SECRET your_session_secret

# Define the command to run your app using CMD.
CMD [ "node", "src/server.js" ]
