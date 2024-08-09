import { TenantAutomator } from "./automator.js";
import cds from '@sap/cds'
const Logger = cds.log('background-tenant-automator')

class BackgroundTenantAutomator extends TenantAutomator {
    constructor(tenant, subdomain, custdomain = null){
        try {
            super(tenant, subdomain, custdomain);
            let brokerCredentials = JSON.parse(process.env["SBF_BROKER_CREDENTIALS"])
            let users = Object.keys(brokerCredentials)
            if (users.length < 1)
                throw new Error("missing service broker credentials")

            this.serviceBroker = {
                user : users[0],
                password : brokerCredentials[users[0]],
                url : process.env["BROKER_URL"],
                name : `${process.env["BROKER_NAME"]}`
            }

            this.cisCentralName = `${process.env["CIS_INSTANCE_PREFIX"]}-cis-central`
            this.destinationName = `${process.env["DESTINATION_NAME_PREFIX"].toUpperCase()}_S4HANA_CLOUD`
        } catch (error) {
            Logger.error("Error initializing tenant automator", error)
            throw error;
        }
    }
}

const execute = async () => {
    const tenantId = process.env["CAPOP_TENANT_ID"]
    if (tenantId === process.env["PROVIDER_TENANT_ID"]) {
        Logger.info("Skipping operation for provider tenant.")
        return // skip execution for provider tenant
    }
    const subdomain = process.env["CAPOP_TENANT_SUBDOMAIN"]
    const automator = new BackgroundTenantAutomator(tenantId, subdomain)

    const tenantOp = process.env["CAPOP_TENANT_OPERATION"]
    switch(tenantOp) {
        case "provisioning":
            return automator.deployTenantArtifacts()
        case "deprovisioning":
            return automator.undeployTenantArtifacts() 
        default:
            throw new Error(`Incorrect tenant operation ${tenantOp}. Aborting...`)
    }
}

execute().then(() => {
    Logger.info("Operation completed successfully.")
    process.exit(0)
}).catch(ex => {
    Logger.info("Operation failed with error: ", ex)
    process.exit(1)
})