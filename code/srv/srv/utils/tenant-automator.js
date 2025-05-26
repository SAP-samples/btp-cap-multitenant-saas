const cis = require('./cloud-management-service')
const sm = require('./service-manager')
const destination = require('./destination')
const cf = require('./cloud-foundry')
const credstore = require('./credential-store')
const logger = cds.log('tenant-automator');
const cfenv = require('cfenv');
const kyma = require('./kyma-helper')
const { getAppEnv } = cfenv;
const appEnv = getAppEnv();
const xsenv = require('@sap/xsenv')

/**
 * Creates a step for workflow execution.
 * @param {Function} operation - The operation function to execute.
 * @param {Function|null} rollback - The rollback function to execute in case of failure.
 * @returns {Object} The step object containing operation, rollback, and name.
 */
const createStep = (operation, rollback = null) => ({
    operation,
    rollback,
    name: operation.name
});

/**
 * Executes a workflow consisting of multiple steps.
 * @param {Array<Object>} steps - The list of steps to execute.
 * @param {Object} context - The execution context.
 * @returns {Promise<Object>} The updated execution context.
 */
const executeWorkflow = async (steps, context = {}) => {
    const executedSteps = [];
    let currentStep;
    try {
        for (const step of steps) {
            logger.log(`Executing step: ${step.name}`);
            currentStep = step.name
            await step.operation(context);
            executedSteps.unshift(step);
            logger.log(`Executed step: ${step.name}`);
        }
        return context;
    } catch (error) {
        logger.error(`Error in step ${currentStep}:`, error.message);
        logger.error('Error details:', error.details)
        logger.log("Rollback will be initiated for:", JSON.stringify(executedSteps))
        for (const step of executedSteps) {
            if (step.rollback) {
                logger.log(`Rolling back step: ${step.name} with ${step.rollback.name}`);
                try {
                    await step.rollback(context);
                    logger.log('Rollback completed:', step.rollback.name)
                } catch (rollbackError) {
                    logger.error(`Rollback error in ${step.name}:`, rollbackError.message);
                }
            }
        }
        throw error;
    }
};

/**
 * Reads Service Manager admin credentials from environment variables.
 * @param {Object} context - The execution context.
 */
const readServiceManagerAdminCredentials = (context) => {
    context.smadmin = xsenv.getServices({ sm: { label: 'service-manager', plan: 'subaccount-admin' } }).sm;
}

/**
 * Creates a Cloud Integration Service (CIS) instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const createCISInstance = async (context) => {
    try {

        context.cis = await sm.createServiceInstance(context.smadmin, `cis-${context.tenant}`, 'cis', 'central', { grantType: "clientCredentials" })
        logger.debug('created cis-central service instance in provider subaccount:', JSON.stringify(context.cisInstance))
    } catch (e) {
        throw {
            message: 'please make sure that service offering:cis, plan:central is entitled to your provider subaccount.',
            details: e.message
        }
    }

}

/**
 * Creates a Cloud Integration Service (CIS) binding.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const createCISBinding = async (context) => {
    try {
        context.cis.binding = await sm.createServiceBinding(context.smadmin, context.cis.id, context.subdomain)
        logger.debug('created cis-central service binding:', JSON.stringify(context.cisInstance))
    } catch (e) {
        throw {
            message: 'service binding for cis-central can not be created',
            details: e.message
        }
    }
};

/**
 * Deletes a Cloud Integration Service (CIS) instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const removeCISInstance = async (context) => {
    try {
        if (!context.cis) {
            logger.debug(`no cis-central found for tenant:${context.tenant}`)
            return
        }
        await sm.deleteServiceInstance(context.smadmin, context.cis.id)
        logger.debug('deleted cis-central service instance with id:', context.cis.id)
        delete context.cis
    } catch (e) {
        throw {
            message: `service instance for cis-central can not be deleted for tenant:${context.tenant}`,
            details: e.message
        }
    }
};

/**
 * Deletes a Cloud Integration Service (CIS) instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const removeCISBinding = async (context) => {
    try {
        if (!context.cis) {
            logger.debug(`no cis-central binding found for instance:${context.cis.id}`)
            return
        }
        await sm.deleteServiceBinding(context.smadmin, context.cis.binding.id)
        logger.debug('deleted cis-central service binding with id:', context.cis.binding.id)
        delete context.cis.binding
    } catch (e) {
        throw {
            message: `service binding for cis-central can not be deleted for tenant:${context.tenant}`,
            details: e.message
        }
    }
};

/**
 * Creates a service manager in tenant subaccount using CIS central instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const createTenantServiceManager = async (context) => {
    try {
        context.smtenant = await cis.createServiceManager(context.cis.binding, context.tenant)
        logger.debug('created service manager in tenant subaccount, subdomain', context.subdomain)
    } catch (e) {
        throw {
            message: `service manager can not be created in tenant subaccount, subdomain:${context.subdomain}`,
            details: e.message
        }
    }
};

/**
 * Removes a service manager in tenant subaccount using CIS central instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const removeTenantServiceManager = async (context) => {
    try {
        if (!context.smtenant) {
            logger.debug(`service manager not found in tenant subaccount, skipped.`, context.subdomain)
            return
        }
        await cis.deleteServiceManager(context.cis.binding, context.tenant)
        logger.debug('deleted service manager in tenant subaccount, subdomain', context.subdomain)
    } catch (e) {
        throw {
            message: `service manager can not be deleted in tenant subaccount, subdomain:${context.subdomain}`,
            details: e.message
        }
    }
};

/**
 * Creates a destination in tenant subaccount using destination service instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const createDestination = async (context) => {
    try {
        const name = process.env.VCAP_APPLICATION ? `${process.env.appName}-${appEnv.app.space_name}_S4HANA_CLOUD` : `${process.env["HELM_RELEASE"].toUpperCase()}_${process.env["KYMA_NAMESPACE"].toUpperCase()}_S4HANA_CLOUD`
        const config = [{
            "Name": name,
            "Type": "HTTP",
            "URL": "https://sandbox.api.sap.com",
            "Authentication": "NoAuthentication",
            "Description": "SusaaS S/4HANA Cloud",
            "ProxyType": "Internet",
            "HTML5.DynamicDestination": "true"
        }];
        await destination.createDestination(context.subdomain, config)
        context.destination.name = name
    } catch (error) {
        throw {
            message: `sample destination can not be created in tenant subaccount, subdomain:${context.subdomain}`,
            details: e.message
        }
    }
};

/**
 * Deletes a destination in tenant subaccount using destination service instance.
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const deleteDestination = async (context) => {
    try {
        await destination.deleteDestination(context.destination.name)
    } catch (error) {
        throw {
            message: `sample destination can not be deleted from tenant subaccount, subdomain:${context.subdomain}`,
            details: e.message
        }
    }
};

/**
 * Reads credentials from BTP credential store
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const readBTPCredentials = async (context) => {
    try {
        if (context.runtime === "cf") {
            const btp = await credstore.readCredential("susaas", "password", "btp-admin-user")
            const broker = await credstore.readCredential("susaas", "password", "susaas-broker-credentials")
            context.broker.user = broker.username;
            context.broker.password = broker.value;
            context.btp.user = btp.username;
            context.btp.password = btp.value
        } else {
            context.broker.user = process.env.BROKER_USER;
            context.broker.password = process.env.BROKER_PASSWORD;
        }

    } catch (e) {
        throw {
            message: `can not read credentials. \n Please check this page: https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/main/docu/2-basic/3-cf-build-deploy-application/README.md#2-setup-the-credential-store`,
            details: e.message
        }
    }

}

/**
 * Logs into CF 
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const loginCF = async (context) => {
    try {
        context.cf.token = await cf.login(context.btp.user, context.btp.password)
    } catch (e) {
        throw {
            message: `can not read credentials. \n Please check this page: https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/main/docu/2-basic/3-cf-build-deploy-application/README.md#2-setup-the-credential-store`,
            details: e.message
        }
    }
}

/**
 * Creates route on tenant provisioning
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const createCFRoute = async (context) => {
    try {
        context.cf.route = await cf.createRoute(context.subdomain + process.env.tenantSeparator + process.env.appName, process.env.appName, context.cf.token)
    } catch (e) {
        throw {
            message: `can not login to CF. \n Please check this page: https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/main/docu/2-basic/3-cf-build-deploy-application/README.md#2-setup-the-credential-store`,
            details: e.message
        }
    }
}

/**
 * Deletes route on tenant deprovisioning
 * @param {Object} context - The execution context.
 * @throws {Object} If service creation fails.
 */
const deleteCFRoute = async (context) => {
    try {
        await cf.deleteRoute(context.subdomain + process.env.tenantSeparator + process.env.appName, process.env.appName, context.cf.token)
    } catch (e) {
        throw {
            message: `can not delete CF Route for tenant:${context.subdomain}`,
            details: e.message
        }
    }
}


const registerServiceBroker = async (context) => {
    try {
        const name = context.runtime === "cf"
            ? `${process.env.brokerName}-${appEnv.app.space_name}`
            : process.env.BROKER_NAME;
         const url = context.runtime === "cf"
            ? process.env.brokerUrl
            : process.env.BROKER_URL;
        await sm.registerServiceBroker(context.smtenant, name, url, 'SusaaS API Service', context.broker.user, context.broker.password)
        context.broker.name = name
    } catch (e) {

        throw {
            message: `service broker for tenant can not be registered.\n Please check this if you are on CF page and make sure you followed steps: https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/main/docu/2-basic/3-cf-build-deploy-application/README.md#2-setup-the-credential-store`,
            details: e.message
        }
    }
}

const deregisterServiceBroker = async (context) => {
    try {
        const name = context.runtime === "cf"
            ? `${process.env.brokerName}-${appEnv.app.space_name}-${context.tenant}`
            : `${process.env.BROKER_NAME}-${context.tenant}`;
            
        const broker = await sm.getServiceBroker(context.smtenant, name)
        if (!broker) {
            logger.debug('broker can not be found, deletion skipped.')
            return;
        }
        await sm.deleteServiceBroker(context.smtenant, broker.id)
    } catch (e) {
        throw {
            message: `service broker for tenant can not be deregistered.\n Please make sure that you delete your SusaaS API instances first.`,
            details: e.message
        }
    }

}

const createKymaApiRule = async (context) => {
    await kyma.createApiRule(kyma.getApiRuleTmpl(context.subdomain))
}

const deleteKymaApiRule = async (context) => {
    await kyma.deleteApiRule(kyma.getApiRuleTmpl(context.subdomain))
}

const workflowStepsCFOnboarding = [
    createStep(readBTPCredentials),
    createStep(readServiceManagerAdminCredentials),
    createStep(createCISInstance, removeCISInstance),
    createStep(createCISBinding, removeCISBinding),
    createStep(createTenantServiceManager, removeTenantServiceManager),
    createStep(registerServiceBroker, deregisterServiceBroker),
    createStep(loginCF),
    createStep(createCFRoute, deleteCFRoute),
    createStep(removeTenantServiceManager),
    createStep(removeCISBinding),
    createStep(removeCISInstance)
];



const workflowStepsCFOffboarding = [
    createStep(readBTPCredentials),
    createStep(readServiceManagerAdminCredentials),
    createStep(createCISInstance, removeCISInstance),
    createStep(createCISBinding, removeCISBinding),
    createStep(createTenantServiceManager, removeTenantServiceManager),
    createStep(deregisterServiceBroker),
    createStep(loginCF),
    createStep(deleteCFRoute),
    createStep(removeTenantServiceManager),
    createStep(removeCISBinding),
    createStep(removeCISInstance)
];


const workflowStepsKymaOnboarding = [
    createStep(readBTPCredentials),
    createStep(readServiceManagerAdminCredentials),
    createStep(createCISInstance, removeCISInstance),
    createStep(createCISBinding, removeCISBinding),
    createStep(createTenantServiceManager, removeTenantServiceManager),
    createStep(registerServiceBroker, deregisterServiceBroker),
    createStep(createKymaApiRule, deleteKymaApiRule),
    createStep(removeTenantServiceManager),
    createStep(removeCISBinding),
    createStep(removeCISInstance)
];


const workflowStepsKymaOffboarding = [
    createStep(readBTPCredentials),
    createStep(readServiceManagerAdminCredentials),
    createStep(createCISInstance, removeCISInstance),
    createStep(createCISBinding, removeCISBinding),
    createStep(createTenantServiceManager, removeTenantServiceManager),
    createStep(deregisterServiceBroker),
    createStep(deleteKymaApiRule),
    createStep(removeTenantServiceManager),
    createStep(removeCISBinding),
    createStep(removeCISInstance)
];

/**
 * Runs the specified workflow based on tenant and operation type.
 * @param {string} tenant - The tenant identifier.
 * @param {string} subdomain - The subdomain associated with the tenant.
 * @param {string} operation - The operation type (e.g., provisioning, deprovisioning).
 * @throws {Object} If workflow execution fails.
 */
const runWorkflow = async (tenant, subdomain, operation) => {
    try {
        const runtime = process.env.VCAP_APPLICATION ? "cf" : "kyma";
        const workflowMap = {
            cf: {
                provisioning: workflowStepsCFOnboarding,
                deprovisioning: workflowStepsCFOffboarding
            },
            kyma: {
                provisioning: workflowStepsKymaOnboarding,
                deprovisioning: workflowStepsKymaOffboarding
            }
        };

        const steps = workflowMap[runtime]?.[operation];
        if (!steps) {
            throw new Error(`Invalid operation: ${operation}. Must be "provisioning" or "deprovisioning".`);
        }

        const context = { runtime, tenant, subdomain, btp: {}, broker: {}, smadmin: {}, smtenant: {}, cis: {}, cf: {} };

        await executeWorkflow(steps, context);
        logger.log('Workflow completed successfully:', { tenant, subdomain });
    } catch (error) {
        logger.error('Workflow failed:', { tenant, subdomain, error: error.message });
        throw error;
    }
};

module.exports = { runWorkflow }
