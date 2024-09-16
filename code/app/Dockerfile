FROM node:lts-slim AS builder

WORKDIR /usr/src/build
RUN mkdir html5-deployer

COPY ui-admin-projects ui-admin-projects/
RUN npm ci --prefix ui-admin-projects
RUN npm run build:copy --prefix ui-admin-projects

COPY ui-admin-users ui-admin-users/
RUN npm ci --prefix ui-admin-users
RUN npm run build:copy --prefix ui-admin-users

COPY ui-public-assessments ui-public-assessments/
RUN npm ci --prefix ui-public-assessments
RUN npm run build:copy --prefix ui-public-assessments

COPY ui-public-flp ui-public-flp/
RUN npm ci --prefix ui-public-flp
RUN npm run build:copy --prefix ui-public-flp

COPY ui-public-projects ui-public-projects/
RUN npm ci --prefix ui-public-projects
RUN npm run build:copy --prefix ui-public-projects

FROM sapse/html5-app-deployer:6.4.1 AS runner

# Bundle app source
COPY --from=builder /usr/src/build/html5-deployer/  .

CMD [ "npm", "start" ]
