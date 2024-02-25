import cfenv from 'cfenv';
import ServiceManager from './service-manager.js';
import CisCentral from './cis-central.js';
import Destination from './destination.js';
import KymaUtils from './kyma-utils.js';
import CredStore from './credStore.js';
import CfUtils from './cf-utils.js';
import cds from '@sap/cds'
const Logger = cds.log('automator')
class TenantAutomator {
    serviceBroker;
    cisCentralName;
    destinationName;

    constructor(tenant, subdomain, custdomain) {
        this.tenant = tenant,
        this.subdomain = subdomain
        this.custdomain = custdomain
    }

    async deployTenantArtifacts() {
        await this.initialize();
        await this.createSampleDestination()
        await this.registerBTPServiceBroker();
        await this.cleanUpCreatedServices();
    }

    async undeployTenantArtifacts() {
        await this.initialize();
        await this.deleteSampleDestination()
        await this.unregisterBTPServiceBroker();
        await this.cleanUpCreatedServices();
    }

    async initialize() {
        try {
            this.cisCentral = await this.createCisCentralInstance();
            this.serviceManager = await this.createServiceManager(this.tenant);
            Logger.log("Automator successfully initialized!")
        } catch (error) {
            Logger.error("Error: Automation can not be initialized!");
            throw error;
        }
    }

    async createCisCentralInstance() {
        try {
            this.cisCentral = new CisCentral();
            let cisParameters = { grantType: "clientCredentials" };

            // Create new CIS Central instance in SAP BTP
            await this.cisCentral.createServiceInstance(this.cisCentralName, "cis", "central", cisParameters);
            // Create service binding for CIS Central instance
            await this.cisCentral.createServiceBinding();

            Logger.log("CIS Central Instance has been created successfully!")
            return this.cisCentral;
        } catch (error) {
            Logger.error("Error: CIS Central Instance can not be created!")
            throw error;
        }
    }

    async createServiceManager(tenant) {
        try {
            // Create service manager using CIS Central instance
            let serviceManagerCredentials = await this.cisCentral.createServiceManager(tenant);

            Logger.log("Service manager has been created successfully!")
            return new ServiceManager(serviceManagerCredentials);
        } catch (error) {
            Logger.error("Error: Service Manager can not be created!")
            throw error;
        }
    }
    
    async cleanUpCreatedServices() {
        try {
            // Delete Service Manager from tenant subaccount
            await this.cisCentral.deleteServiceManager(this.tenant);
            // Delete CIS Central instance service binding from SAP BTP
            await this.cisCentral.deleteServiceBinding();
            // Delete CIS Central instance from SAP BTP
            await this.cisCentral.deleteServiceInstance();

            Logger.log("Clean up successfully completed!");
        } catch (error) {
            Logger.error("Error: Clean up can not be completed!");
            throw error;
        }
    }
    
    async registerBTPServiceBroker() {
        try {
            await this.serviceManager.createServiceBroker(
                this.serviceBroker.name,
                this.serviceBroker.url,
                "Sustainable SaaS API Broker",
                this.serviceBroker.user,
                this.serviceBroker.password
            );
            Logger.log("Susaas Inbound API Broker registered successfully!")
        } catch (error) {
            Logger.error("Error: Service broker cannot be registered!")
            Logger.error(`Error: ${error.message}`);
        }
    }

    async unregisterBTPServiceBroker() {
        try {
            let sb = await this.serviceManager.getServiceBroker(`${this.serviceBroker.name}-${this.tenant}`)
            await this.serviceManager.deleteServiceBroker(sb.id)
            Logger.log(`Service Broker ${this.serviceBroker.name} deleted`);
        } catch (error) {
            Logger.error(`Error: Service Broker can not be deleted`);
            Logger.error(`Error: ${error.message}`);
        }
    }

    async createSampleDestination() {
        try {
            const destName = this.destinationName;
            const destConfig = [{
                "Name": destName,
                "Type": "HTTP",
                "URL": "https://sandbox.api.sap.com",
                "Authentication": "NoAuthentication",
                "Description": "SusaaS S/4HANA Cloud",
                "ProxyType": "Internet",
                "HTML5.DynamicDestination": "true"
            }];
            const destination = new Destination(this.subdomain);
            await destination.createDestination(destConfig)
            Logger.log(`Sample destination ${destName} is created in tenant subaccount`);
        } catch (error) {
            Logger.error("Error: Sample destination can not be created in tenant subaccount")
            Logger.error(`Error: ${error.message}`);
        }
    }
    
    async deleteSampleDestination() {
        try {
            const destName = this.destinationName;
            const destination = new Destination(this.subdomain);
            await destination.deleteDestination(destName)
            Logger.log(`Sample destination ${destName} is deleted from tenant subaccount`);
        } catch (error) {
            Logger.error(`Error: Sample destination ${destName} can not be deleted from tenant subaccount`);
            Logger.error(`Error: ${error.message}`);
        }
    }
}


class Kyma extends TenantAutomator {
    constructor(tenant, subdomain, custdomain = null){
        try{
            super(tenant, subdomain, custdomain);
            this.serviceBroker = {
                user : process.env["BROKER_USER"],
                password : process.env["BROKER_PASSWORD"],
                url : process.env["BROKER_URL"],
                name : `${process.env["BROKER_NAME"]}-${process.env["KYMA_NAMESPACE"]}`
            }

            this.cisCentralName = `${process.env["HELM_RELEASE"]}-${process.env["KYMA_NAMESPACE"]}-cis-central`
            this.destinationName = `${process.env["HELM_RELEASE"].toUpperCase()}_${process.env["KYMA_NAMESPACE"].toUpperCase()}_S4HANA_CLOUD`
        } catch (error) {
            Logger.error("Error: Error initializing the automator!")
            throw error;
        }
    }

    async deployTenantArtifacts(){
        try{
            await super.deployTenantArtifacts();
            const kymaUtils = new KymaUtils(this.subdomain, this.custdomain);
            await kymaUtils.createApiRule(kymaUtils.getApiRuleTmpl());
            Logger.log("Automation: Deployment has been completed successfully!")
        } catch (error) {
            Logger.error("Error: Tenant artifacts cannot be deployed!") 
            throw error;
        }
    }

    async undeployTenantArtifacts(){
        try{
            await super.undeployTenantArtifacts();
            const kymaUtils = new KymaUtils(this.subdomain);
            await kymaUtils.deleteApiRule(kymaUtils.getApiRuleTmpl());
            Logger.log("Automation: Undeployment has been completed successfully!")
        } catch (error) {
            Logger.error("Error: Tenant artifacts cannot be undeployed!")
            throw error;
        }
    }

}

class CloudFoundry extends TenantAutomator {

    constructor(tenant, subdomain, custdomain = null){
        try{
            super(tenant, subdomain, custdomain);

            const { getAppEnv } = cfenv;
            const appEnv = getAppEnv();

            this.serviceBroker = {
                user : null,
                password : null,
                url : process.env.brokerUrl,
                name : `${process.env.brokerName}-${appEnv.app.space_name}`
            }

            this.cisCentralName = `${process.env.appName}-${appEnv.app.space_name}-cis-central`
            this.destinationName = `SUSAAS_S4HANA_CLOUD`
            this.credentials = new Map();
            this.cfUtils = new CfUtils();
        } catch (error) {
            Logger.error("Error: Error initializing the automator!")
            throw error;
        }
    }

    async initialize(){
        try{
            await super.initialize();
            await this.readCredentials();

            let btpAdmin = this.credentials.get("btp-admin-user")
            await this.cfUtils.login(btpAdmin.username, btpAdmin.value);

            Logger.log("Cloud Foundry login successful!")
        } catch (error) {
            Logger.error("Error: Cloud Foundry login not successful");
            throw error;
        }
    }

    async deployTenantArtifacts(){
        try {
            await super.deployTenantArtifacts();
            // Don't create route in case of '.' used as tenant separator - wildcard route used!
            process.env.tenantSeparator !== '.' && await this.createRoute();
            Logger.log("Automation: Deployment has been completed successfully!")
        } catch (error) {
            Logger.error("Error: Tenant artifacts cannot be deployed!") 
            throw error;
        }
    }

    async undeployTenantArtifacts(){
        try{
            await super.undeployTenantArtifacts();
            // Don't create route in case of '.' used as tenant separator - wildcard route used!
            process.env.tenantSeparator !== '.' && await this.deleteRoute();
            Logger.log("Automation: Undeployment has been completed successfully!")
        } catch (error) {
            Logger.error("Error: Tenant artifacts cannot be undeployed!")
            throw error;
        }
    }

    async createRoute() {
        try {
            await this.cfUtils.createRoute(this.subdomain + process.env.tenantSeparator + process.env.appName, process.env.appName);
        } catch (error) {
            Logger.error("Error: Route could not be created!")
            throw error;
        }
    }

    async deleteRoute() {
        try {
            await this.cfUtils.deleteRoute(this.subdomain + process.env.tenantSeparator  + process.env.appName, process.env.appName);
        } catch (error) {
            Logger.error("Error: Route could not be deleted!")
            throw error;
        }
    }

    async readCredentials() {
        try {
            const credStore = new CredStore();
            let btpAdminUser = await credStore.readCredential("susaas", "password", "btp-admin-user")
            let serviceBroker = await credStore.readCredential("susaas", "password", "susaas-broker-credentials")

            this.credentials.set(btpAdminUser.name, btpAdminUser)
            this.credentials.set(serviceBroker.name, serviceBroker)

            this.serviceBroker.user = serviceBroker.username;
            this.serviceBroker.password = serviceBroker.value;
            
            Logger.log("Credentials retrieved from credential store successfully");
        } catch (error) {
            Logger.error('Unable to retrieve credentials from cred store, please make sure that they are created! Automation skipped!');
            throw (error);
        }
    }

}

export default (process.env.VCAP_APPLICATION ? CloudFoundry : Kyma)