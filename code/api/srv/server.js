import cds from '@sap/cds';
import express from 'express';

cds.on('bootstrap', async (app) => {
    app.get('/healthz', (_, res) => { res.status(200).send('OK') })
    app.use(express.json({ limit: '50MB' }))
});

export default cds.server;

