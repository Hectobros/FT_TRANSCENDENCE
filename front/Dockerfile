FROM node:18 AS builder
WORKDIR /app

ADD . /app
WORKDIR /app
RUN npm install && npm config set fetch-retry-maxtimeout 120000 && npm run build

# production stage
FROM nginx:1.22.1-alpine
COPY --from=builder /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf 

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
