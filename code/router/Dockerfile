FROM sapse/approuter:16.6.2

# Create app directory
RUN mkdir -p /app
RUN chown node.node /app

WORKDIR /app

# Bundle app source
COPY . .

CMD [ "node", "index.js" ]