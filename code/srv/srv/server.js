import cds from '@sap/cds';
import cdsSwagger from 'cds-swagger-ui-express';
import cov2ap from '@cap-js-community/odata-v2-adapter'
import ProvisioningService from './provisioning.js'

cds.on('bootstrap', async (app) => {
    app.get('/healthz', (_, res) => res.status(200).send('OK'));
    app.use(cov2ap());
    app.use(cdsSwagger({ "basePath": "/swagger", "diagram": "true"}));  
});

cds.on('served', async () => {
    const { 'cds.xt.SaasProvisioningService': provisioning } = cds.services

    // Add provisioning logic if only multitenancy is there
    if(provisioning){
        provisioning.prepend(new ProvisioningService().service);
    }else{
        cds.log().warn("There is no service, therefore does not serve multitenancy!");
    }
});

export default cds.server;