const xsenv = require('@sap/xsenv');
const TokenUtils = require('./token-helper.js');
const cds = require('@sap/cds');
let sm = new Object();
const Logger = cds.log('tenant-automator');

// Get service manager binding from environment
if (cds.env.profiles.find(p => p.includes("hybrid") || p.includes("production"))) {
    sm = xsenv.getServices({ sm: { label: 'service-manager', plan: 'subaccount-admin' } }).sm;
}

// Token Store
let tokenStore = {};

// Function to create a service instance
async function createServiceInstance(serviceName, serviceOffering, servicePlan, parameters) {
    try {
        const body = {
            name: serviceName,
            service_offering_name: serviceOffering,
            service_plan_name: servicePlan,
            parameters: parameters,
        };
        const token = await getToken();
        const optionsInstance = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        };
        const response = await fetch(sm.sm_url + `/v1/service_instances`, optionsInstance);

        if (!response.ok) {
            throw new Error(`Failed to create service instance: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        Logger.debug(`Service instance successfully created for ${serviceOffering}-${servicePlan}`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service instance cannot be created for ${serviceOffering}-${servicePlan}`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

// Function to create a service binding
async function createServiceBinding(instanceDetails) {
    try {
        const token = await getToken();
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: instanceDetails.id, service_instance_id: instanceDetails.id })
        };
        const response = await fetch(sm.sm_url + `/v1/service_bindings`, options);

        if (!response.ok) {
            throw new Error(`Failed to create service binding: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        Logger.debug(`Service binding created for ${instanceDetails.id}`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service binding cannot be created for ${instanceDetails.id}`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

// Function to delete a service instance
async function deleteServiceInstance(instanceDetails) {
    try {
        const token = await getToken();
        const optionsInstance = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(sm.sm_url + `/v1/service_instances/${instanceDetails.id}`, optionsInstance);

        if (!response.ok) {
            throw new Error(`Failed to delete service instance: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        Logger.debug(`Service instance ${instanceDetails.id} successfully deleted`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service instance cannot be deleted`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

// Function to delete a service binding
async function deleteServiceBinding(bindingDetails) {
    try {
        const token = await getToken();
        const optionsInstance = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(sm.sm_url + `/v1/service_bindings/${bindingDetails.id}`, optionsInstance);

        if (!response.ok) {
            throw new Error(`Failed to delete service binding: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        Logger.debug(`Service binding ${bindingDetails.id} successfully deleted`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service binding cannot be deleted`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

// Function to create a service manager
async function createServiceManager(binding, tenant) {
    try {
        const clientid = binding.credentials.uaa.clientid;
        const clientsecret = binding.credentials.uaa.clientsecret;
        const tokenEndpoint = `${binding.credentials.uaa.url}/oauth/token`;
        const token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, clientid, clientsecret);
        const authOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`${binding.credentials.endpoints.accounts_service_url}/accounts/v1/subaccounts/${tenant}/serviceManagementBinding`, authOptions);

        if (!response.ok) {
           if(response.status===409){
              return await getServiceManager(binding,tenant,token)
           }else{
            throw new Error(`${response.status} ${response.statusText}`);
           }
            
        }

        const data = await response.json();
        Logger.debug(`Service manager in tenant subaccount ${tenant} successfully created`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service manager cannot be created in tenant subaccount ${tenant}`);
        Logger.debug(`Error: ${error.message}`);
        Logger.debug("Error: Broker automation skipped");
        throw error;
    }
}

// Function to delete a service manager
async function deleteServiceManager(binding,tenant) {
    try {
        const clientid = binding.credentials.uaa.clientid;
        const clientsecret = binding.credentials.uaa.clientsecret;
        const tokenEndpoint = `${binding.credentials.uaa.url}/oauth/token`;
        const token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, clientid, clientsecret);
        const authOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`${binding.credentials.endpoints.accounts_service_url}/accounts/v1/subaccounts/${tenant}/serviceManagementBinding`, authOptions);

        if (!response.ok) {
            if (response.status === 404) {
                return;
            } else {
                const error = await response.json();
                throw {
                    message: error.description
                }
            }
        }else {
           Logger.debug(`Service manager in tenant subaccount ${tenant} successfully deleted`);    
           return;
        }
    } catch (error) {
        Logger.debug(`Error: Service manager cannot be deleted from tenant subaccount ${tenant}`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function getServiceManager(binding,tenant,token){
    try {

        const authOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const response = await fetch(`${binding.credentials.endpoints.accounts_service_url}/accounts/v1/subaccounts/${tenant}/serviceManagementBinding`, authOptions);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        Logger.debug(`Service manager in tenant subaccount ${tenant} successfully retrieved`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service manager cannot be retrieved in tenant subaccount ${tenant}`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

// Function to get a token
async function getToken() {
    try {
        if (!tokenStore.token) {
            const tokenEndpoint = sm.url + '/oauth/token';
            tokenStore.token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, sm.clientid, sm.clientsecret);
        }
        return tokenStore.token;
    } catch (error) {
        Logger.debug("Error: Unable to get a token for Service Manager");
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

module.exports = { 
    createServiceInstance, 
    createServiceBinding, 
    deleteServiceInstance, 
    deleteServiceBinding, 
    createServiceManager, 
    deleteServiceManager 
};
