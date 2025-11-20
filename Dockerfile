FROM node:22-bullseye AS build
WORKDIR /app

# Build the web app located in /web using its package.json
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install --legacy-peer-deps
COPY web/ ./
RUN npm run build

FROM node:22-bullseye AS runtime
WORKDIR /app
COPY --from=build /app/web/dist ./dist
COPY server.js /app/server.js

EXPOSE 8080
CMD ["node", "server.js"]