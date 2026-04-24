FROM node:20.13.1-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN npm config set registry http://verdaccio:4873 \
    && npm config set //verdaccio:4873/:username admin \
    && npm config set //verdaccio:4873/:_password YWRtaW4= \
    && npm config set //verdaccio:4873/:email admin@verdaccio.local
RUN yarn config set registry http://verdaccio:4873
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:20.13.1-slim AS production

WORKDIR /app

COPY package.json yarn.lock ./
ENV NODE_ENV=production
RUN npm config set registry http://verdaccio:4873 \
    && npm config set //verdaccio:4873/:username admin \
    && npm config set //verdaccio:4873/:_password YWRtaW4= \
    && npm config set //verdaccio:4873/:email admin@verdaccio.local \
    && yarn config set registry http://verdaccio:4873 \
    && yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

EXPOSE 3202
EXPOSE 9229

CMD ["node", "dist/index.js"]



