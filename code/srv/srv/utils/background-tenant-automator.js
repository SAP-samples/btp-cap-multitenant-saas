const { runWorkflow } = require("./tenant-automator.js");
const cds = require('@sap/cds')
const Logger = cds.log('background-tenant-automator')

const execute = async () => {
    const tenantId = process.env["CAPOP_TENANT_ID"]
    if (tenantId === process.env["PROVIDER_TENANT_ID"]) {
        Logger.info("Skipping operation for provider tenant.")
        return // skip execution for provider tenant
    }
    const subdomain = process.env["CAPOP_TENANT_SUBDOMAIN"]

    const tenantOp = process.env["CAPOP_TENANT_OPERATION"]
    switch(tenantOp) {
        case "provisioning":
            return runWorkflow(tenantId,subdomain,tenantOp)
        case "deprovisioning":
            return runWorkflow(tenantId,subdomain,tenantOp)
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