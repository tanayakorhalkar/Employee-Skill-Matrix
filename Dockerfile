FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose dev/preview port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "run", "start"]
