FROM alpine:3.20 as build

RUN apk add -U --no-cache nodejs npm
RUN node -v

WORKDIR /usr/src/build
COPY package*.json .
COPY db db
COPY db-com db-com
COPY api api
COPY srv srv

RUN ["npm", "ci"]
RUN ["npx", "--package=@sap/cds-dk@7", "cds", "build", "--production"]

WORKDIR /usr/src/build/gen/srv

RUN ["npm", "ci", "--production"]

FROM alpine:3.20 as run

RUN addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node

RUN apk add --no-cache --update --repository=https://dl-cdn.alpinelinux.org/alpine/edge/main openssl zlib icu-data-full libuv

RUN apk add -U --no-cache nodejs npm \
    && apk -U upgrade \
    && npm update -g npm

USER node

WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/build/gen/srv/ /usr/src/app/

CMD ["node", "node_modules/@sap/cds/bin/cds-serve.js"]