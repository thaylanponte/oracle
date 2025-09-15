# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN npm ci || npm install
COPY tsconfig.json ./
COPY src ./src
COPY data ./data
RUN npm run build

# Etapa de runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY data ./data
EXPOSE 3009
CMD ["node", "dist/server.js"]
