import cds from '@sap/cds';
import cov2ap from '@cap-js-community/odata-v2-adapter'
import ProvisioningService from './provisioning.js'
import xsenv from '@sap/xsenv'

cds.on('bootstrap', async (app) => {
    app.use(cov2ap());

    // Workaround to be removed for common db deployment on Kyma scenario.
    // CAP Emulator does not function properly for HANA Common DB case and 
    // it overwrites existing HANA container with common so deployment fails.
    if (process.env.KYMA_DEPLOYMENT) {
        console.log("Emulating the common db container")
        var services = xsenv.getServices('/bindings', {
            hana: { tag: 'hana' }
        });
        process.env.VCAP_SERVICES = JSON.stringify({
            hana: [
                {
                    "name": "common-db",
                    "tags":["hana"],
                    "credentials": {
                        ...services.hana
                    },
                }
            ]
        })
    }
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