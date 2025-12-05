# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json .eslintrc.json ./
COPY src ./src
COPY public ./public
COPY db ./db
RUN npm install && npm run build

# Run stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY public ./public
COPY db ./db
EXPOSE 3000
CMD ["node", "dist/server.js"]

