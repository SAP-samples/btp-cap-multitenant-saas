import cds from '@sap/cds';
import xsenv from '@sap/xsenv';
import Automator from './utils/automator.js';
import AlertNotification from './utils/alertNotification.js';
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
    
            Logger.log("Subscription Params: " + params);
            const { custSubdomain: custdomain = null } = params;

            Logger.log('Custdomain ' + custdomain);
            const tenantURL = this.getTenantUrl(subdomain, custdomain);
            
            // Trigger default provisioning tasks like HANA deployment
            await next();
    
            // Trigger additional provisioning tasks in the background like
            // Tenant service broker registration
            // Sample Destination registration
            cds.spawn({ tenant: tenant }, async (tx) => {
                try {
                    // Create artifacts in subscriber subaccount
                    const automator = new Automator(tenant, subdomain, custdomain);
                    await automator.deployTenantArtifacts();
                    
                    Logger.log("Success: Onboarding completed!");
    
                } catch (error) {
                    const alertNotification = new AlertNotification();
                    
                    // Send generic alert using Alert Notification if service binding exists
                    alertNotification.bindingExists ?
                        alertNotification.sendEvent({
                            type : 'GENERIC',
                            data : {
                                subject : 'Error: Automation skipped because of error during subscription!',
                                body : JSON.stringify(error.message),
                                eventType : 'alert.app.generic',
                                severity : 'FATAL',
                                category : 'ALERT'
                            }
                        }) : '';
    
                    // Log error
                    Logger.error("Error: Automation skipped because of error during subscription");
                    Logger.error(`Error: ${error.message}`);
                }
            })
    
            return tenantURL;
        });
    
        service.on('DELETE', 'tenant', async (req, next) => {
            Logger.log('Unsubscribe Data: ', JSON.stringify(req.data));
            const { subscribedSubdomain: subdomain, subscribedTenantId : tenant }  = req.data;
            
            await next();
    
            try {
                const automator = new Automator(tenant, subdomain);
                await automator.undeployTenantArtifacts();
                
                Logger.log("Success: Unsubscription completed!");
    
            } catch (error) {
                const alertNotification = new AlertNotification();
                    
                // Send generic alert using Alert Notification if service binding exists
                alertNotification.bindingExists ?
                    alertNotification.sendEvent({
                        type : 'GENERIC',
                        data : {
                            subject : 'Error: Automation skipped because of error during unsubscription!',
                            body : JSON.stringify(error.message),
                            eventType : 'alert.app.generic',
                            severity : 'FATAL',
                            category : 'ALERT'
                        }
                    }) : '';
    
                Logger.error("Error: Automation skipped because of error during unsubscription");
                Logger.error(`Error: ${error.message}`);
            }
    
            return tenant;
        });
    
    
        service.on('upgradeTenant', async (req, next) => {
            await next();
            const { instanceData, deploymentOptions } = cds.context.req.body;
            Logger.log('UpgradeTenant: ', req.data.subscribedTenantId, req.data.subscribedSubdomain, instanceData, deploymentOptions);
        });
    
    
        service.on('dependencies', async (req, next) => {
            let dependencies = await next();
            const services = xsenv.getServices({
                html5Runtime: { tag: 'html5-apps-repo-rt' },
                destination: { tag: 'destination' }
            });
    
            dependencies.push({ xsappname: services.html5Runtime.uaa.xsappname });
            dependencies.push({ xsappname: services.destination.xsappname });
            
            Logger.log("SaaS Dependencies:", JSON.stringify(dependencies));
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


export default process.env.VCAP_APPLICATION ? CloudFoundry : Kyma;