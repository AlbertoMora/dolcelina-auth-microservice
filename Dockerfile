FROM node:20.13.1-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:20.13.1-slim AS production

WORKDIR /app

COPY package.json yarn.lock ./
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

EXPOSE 3202

CMD ["node", "dist/index.js"]



