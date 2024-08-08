FROM alpine:3.20 as build

RUN apk add -U --no-cache nodejs npm

WORKDIR /usr/src/build
COPY package*.json start.js ./

RUN ["npm", "ci", "--production"]

FROM alpine:3.20 as run

RUN addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node

RUN apk add --no-cache --update --repository=https://dl-cdn.alpinelinux.org/alpine/edge/main openssl zlib icu-data-full libuv

RUN apk add -U --no-cache nodejs npm \
    && apk -U upgrade \
    && npm update -g npm

USER node

WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/build/ /usr/src/app/

CMD ["node", "start.js"]
