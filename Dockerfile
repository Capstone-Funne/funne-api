FROM node:18.15.0-alpine3.17 AS build
RUN npm i -g pnpm@8.5.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY prisma/ prisma/
RUN pnpx prisma generate

FROM node:18.15.0-alpine3.17
WORKDIR /usr/src/app
COPY --from=build node_modules ./node_modules
COPY package.json .
COPY src ./src

CMD [ "node", "src/server.js" ]