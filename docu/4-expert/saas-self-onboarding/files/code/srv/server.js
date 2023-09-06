import cds from '@sap/cds';

cds.on('bootstrap', async (app) => {
    app.get('/healthz', (_, res) => { res.status(200).send('OK')});
});

export default cds.server;