# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package*.json ./

# Install Node modules
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose Vite's default development port
EXPOSE 5173

# Run the Vite development server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]