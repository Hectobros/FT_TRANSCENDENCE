FROM node:18 AS builder

RUN mkdir -p /app 

ADD db-interface/ /app/db-interface
WORKDIR /app/db-interface
RUN npm install

ADD user-api/ /app/user-api
WORKDIR /app/user-api
RUN npm install && npm run build

FROM busybox:1.35.0-uclibc as busybox
FROM gcr.io/distroless/nodejs:18
COPY --from=builder /app/user-api /app

COPY --from=busybox /bin/sh /bin/sh
COPY --from=busybox /bin/ls /bin/ls
COPY --from=busybox /bin/cp /bin/cp
COPY --from=busybox /bin/mv /bin/mv

WORKDIR /app/dist

ENV PORT="3000"

CMD [ "user-api/src/main.js" ]
