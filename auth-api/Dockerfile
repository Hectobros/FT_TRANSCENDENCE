FROM node:18 AS builder

ADD . /app
WORKDIR /app

RUN npm install && npm run build

FROM gcr.io/distroless/nodejs:18
COPY --from=builder /app /app

WORKDIR /app/dist

ENV PORT="3000"

CMD [ "main.js" ]
