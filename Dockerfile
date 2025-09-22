# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# ✅ Increase memory for React build
# 4096 MB (4GB), you can raise to 8192 (8GB) if host machine supports it
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build

EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3001"]
