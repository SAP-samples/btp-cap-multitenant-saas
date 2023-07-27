import cds from '@sap/cds';
import cdsSwagger from 'cds-swagger-ui-express';
import odatav2adapterproxy from '@sap/cds-odata-v2-adapter-proxy';
import ProvisioningService from './provisioning.js'

cds.on('bootstrap', async (app) => {
    app.get('/healthz', (_, res) => res.status(200).send('OK'));
    app.use(cdsSwagger({ "basePath": "/swagger", "diagram": "true"}));
    app.use(odatav2adapterproxy());    
});

cds.on('served', async () => {
    const { 'cds.xt.SaasProvisioningService': provisioning } = cds.services

    // Add provisioning logic if only multitenancy is there
    if(provisioning){
        provisioning.prepend(new ProvisioningService().service);
    }else{
        console.log("There is no service, therefore does not serve multitenancy!");
    }
});

export default cds.server;