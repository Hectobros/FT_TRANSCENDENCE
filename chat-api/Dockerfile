FROM node:18 AS builder

RUN mkdir -p /app 

ADD db-interface/ /app/db-interface
WORKDIR /app/db-interface
RUN npm install

ADD chat-api/ /app/chat
WORKDIR /app/chat
RUN npm install && npm run build

FROM gcr.io/distroless/nodejs:18
COPY --from=builder /app/chat /app

WORKDIR /app/dist

ENV PORT="3000"

CMD [ "chat/src/main.js" ]

