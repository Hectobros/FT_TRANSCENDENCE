FROM node:18 AS builder

RUN mkdir -p /app 

ADD db-interface/ /app/db-interface
WORKDIR /app/db-interface
RUN npm install

ADD game-api/ /app/game
WORKDIR /app/game
RUN npm install && npm config set fetch-retry-maxtimeout 120000 && npm run build

FROM gcr.io/distroless/nodejs:18
COPY --from=builder /app/game /app

WORKDIR /app/dist

ENV PORT="3000"

CMD [ "game/src/main.js" ]