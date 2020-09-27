FROM node:12

WORKDIR /app

# Copy packge.json first
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

CMD ["npx", "nodemon", "-L"]
# -L for --legacy-watch. Needed b/c I'm using Windows.