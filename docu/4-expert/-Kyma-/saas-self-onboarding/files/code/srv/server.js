const cds = require('@sap/cds');
const cookieParser = require('cookie-parser');
const cov2ap = require('@cap-js-community/odata-v2-adapter');

cds.on('bootstrap', async (app) => {
    app.use(cookieParser());
    app.use(cov2ap());
    
    app.get('/healthz', (_, res) => { res.status(200).send('OK')});
});

module.exports = cds.server;