FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY dist ./dist
COPY public ./public
EXPOSE 3000
CMD ["node", "dist/main"]
