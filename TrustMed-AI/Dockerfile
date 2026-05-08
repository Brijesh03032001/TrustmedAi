# Use Node 20 (compatible with Next.js)
FROM node:20-alpine

# Install Python & venv support
RUN apk add --no-cache python3 py3-pip py3-virtualenv

# Set working directory
WORKDIR /app

# Create virtual environment
RUN python3 -m venv /pyenv

# Activate virtual environment
ENV PATH="/pyenv/bin:$PATH"

# Copy Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements
COPY requirements.txt .

# Install Python packages inside the venv
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
