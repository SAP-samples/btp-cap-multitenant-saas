const cds = require('@sap/cds');
const xsenv = require('@sap/xsenv');
const {runWorkflow} = require('./utils/tenant-automator.js');
const AlertNotification = require('./utils/alert-notification.js');
const Logger = cds.log('provisioning')
class Provisioning {    
    service = (service) => {
        service.on('UPDATE', 'tenant', async (req, next) => {
            Logger.log('Subscription Data: ', JSON.stringify(req.data));
            const { 
                subscribedSubdomain: subdomain, 
                subscribedTenantId : tenant, 
                subscriptionParams : params = {}
            }  = req.data;
    
            const { custSubdomain: custdomain = null } = params;
            const tenantURL = this.getTenantUrl(subdomain, custdomain);
            await next();
            await runWorkflow(tenant,subdomain,"provisioning")
            return tenantURL;
        });
    
        service.on('DELETE', 'tenant', async (req, next) => {
            Logger.log('Unsubscribe Data: ', JSON.stringify(req.data));
            const { subscribedSubdomain: subdomain, subscribedTenantId : tenant }  = req.data;
            await next();
            await runWorkflow(tenant,subdomain,"deprovisioning")
            return tenant;
        });
    
    
        service.on('upgradeTenant', async (req, next) => {
            await next();
            const { instanceData, deploymentOptions } = cds.context.req.body;
            Logger.log('UpgradeTenant: ', req.data.subscribedTenantId, req.data.subscribedSubdomain, instanceData, deploymentOptions);
        });
    
    
        service.on('dependencies', async (_, next) => {
            let dependencies = await next();
            const services = xsenv.getServices({
                html5Runtime: { tag: 'html5-apps-repo-rt' },
                destination: { tag: 'destination' }
            });
    
            dependencies.push({ xsappname: services.html5Runtime.uaa.xsappname });
            dependencies.push({ xsappname: services.destination.xsappname });
            
            Logger.debug("SaaS Dependencies:", JSON.stringify(dependencies));
            return dependencies;
        });
    }
}

class Kyma extends Provisioning {
    getTenantUrl(subdomain, custdomain){
        if(custdomain && custdomain !== '') { 
            Logger.log(`Custom subdomain - ${custdomain} - used for tenant Url!`)
            return "https:\/\/" + `${custdomain}.${process.env["CLUSTER_DOMAIN"]}`
        }else{
            return "https:\/\/" + `${subdomain}-${process.env["ROUTER_NAME"]}-${process.env["KYMA_NAMESPACE"]}.${process.env["CLUSTER_DOMAIN"]}`;
        }
    }
}

class CloudFoundry extends Provisioning {
    getTenantUrl(subdomain){
        return `https://${subdomain}${process.env.tenantSeparator}${process.env.appDomain}`;
    }
}


module.exports =  process.env.VCAP_APPLICATION ? CloudFoundry : Kyma;