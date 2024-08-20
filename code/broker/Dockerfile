FROM node:lts-alpine3.20 as run

USER node

WORKDIR /usr/src/app

COPY --chown=node:node package*.json start.js ./

RUN ["npm", "ci", "--production"]

CMD ["node", "start.js"]
