FROM sapse/html5-app-deployer:5.0.0

# Create app directory
RUN mkdir -p /app
RUN chown node.node /app

WORKDIR /app

# Bundle app source
COPY . .

CMD [ "npm", "start" ]