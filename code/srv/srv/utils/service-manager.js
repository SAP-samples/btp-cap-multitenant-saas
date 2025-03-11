const TokenUtils = require('./token-helper.js');
const cds = require('@sap/cds');
const Logger = cds.log('tenant-automator');

async function createServiceInstance(serviceCredentials, serviceName, serviceOffering, servicePlan, parameters = {}) {

    const body = {
        name: serviceName,
        service_offering_name: serviceOffering,
        service_plan_name: servicePlan,
        parameters: parameters
    };

    const token = await getToken(serviceCredentials);

    const response = await fetch(serviceCredentials.sm_url + `/v1/service_instances`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        if (response.status === 409) {
            return await getServiceInstanceByName(serviceCredentials, serviceName, token)
        } else {
            const error = await response.json();
            throw {
                message: error.description
            }
        }
    }
    const data = await response.json();
    Logger.debug(`Service instance successfully created for ${serviceOffering}-${servicePlan}`);
    return data;
}

async function createServiceBinding(serviceCredentials, serviceInstanceId, subscribingSubdomain) {
    try {
        const token = await getToken(serviceCredentials);

        const response = await fetch(serviceCredentials.sm_url + `/v1/service_bindings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: subscribingSubdomain, service_instance_id: serviceInstanceId })
        });

        if (!response.ok) {
            if (response.status === 409) {
                return await getServiceBindingsByName(serviceCredentials, subscribingSubdomain, token)
            } else {
                const error = await response.json();
                throw {
                    message: error.description
                }
            }
        }
        const data = await response.json();
        Logger.debug(`Service binding created for ${serviceInstanceId}`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service binding can not be created for ${serviceInstanceId}`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function deleteServiceInstance(serviceCredentials, serviceInstanceId) {
    try {
        const token = await getToken(serviceCredentials);

        const response = await fetch(serviceCredentials.sm_url + `/v1/service_instances/${serviceInstanceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                return;
            } else {
                const error = await response.json();
                throw {
                    message: error.description
                }
            }
        } else {
            return
        }

    } catch (error) {
        Logger.debug(`Error: Service instance can not be deleted`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function deleteServiceBinding(serviceCredentials, serviceBindingId) {
    try {
        const token = await getToken(serviceCredentials);

        const response = await fetch(serviceCredentials.sm_url + `/v1/service_bindings/${serviceBindingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw {
                message: error.description
            }
        }
        const data = await response.json();
        Logger.debug(`Service binding ${serviceBindingId} successfully deleted`);
        return data;
    } catch (error) {
        Logger.debug(`Error: Service binding can not be deleted`);
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}


async function getToken(serviceCredentials) {
    try {
        const tokenEndpoint = serviceCredentials.url + '/oauth/token';
        return await TokenUtils.getTokenWithClientCreds(tokenEndpoint, serviceCredentials.clientid, serviceCredentials.clientsecret);
    } catch (error) {
        Logger.debug("Error: Unable to get a token for Service Manager");
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function registerServiceBroker(serviceCredentials, name, url, description, user, password) {
    const body = {
        name: name,
        broker_url: url,
        description: description,
        credentials: {
            basic: {
                username: user,
                password: password
            }
        }
    };

    try {
        const token = await getToken(serviceCredentials);

        const response = await fetch(serviceCredentials.sm_url + `/v1/service_brokers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            if(response.status===409){
                // already exist ? then ok...
                Logger.debug(`service broker ${name} already registered to subaccount.`)
                return
            }
            const error = await response.json();
            throw {
                message: error.description
            }
        }
        const data = await response.json();
        Logger.debug(`Service Broker ${name} successfully created`);
        return data;
    } catch (error) {
        Logger.debug("Error: Service Broker can not be created");
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function deleteServiceBroker(serviceCredentials, serviceBrokerId) {
    try {
        const token = await getToken(serviceCredentials);

        const response = await fetch(serviceCredentials.sm_url + `/v1/service_brokers/${serviceBrokerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                return
            } else {
                const error = await response.json();
                throw {
                    message: error.description
                }
            }
        }
        const data = await response.json();
        Logger.debug(`Service Broker ${serviceBrokerId} successfully deleted`);
        return data;
    } catch (error) {
        Logger.debug("Error: Service Broker can not be deleted");
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function getServiceBroker(serviceCredentials, name) {
    try {
        const token = await getToken(serviceCredentials);

        const response = await fetch(serviceCredentials.sm_url + `/v1/service_brokers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw {
                message: error.description
            }
        }
        const data = await response.json();
        Logger.debug(`Service Broker ${name} successfully retrieved`);
        return data.items[0];
    } catch (error) {
        Logger.debug("Error: Unable to retrieve Service Broker");
        Logger.debug(`Error: ${error.message}`);
        throw error;
    }
}

async function getServiceInstanceByName(serviceCredentials, name, token) {
    const query = `name eq '${name}'`;
    const encodedQuery = encodeURIComponent(query);
    const url = `${serviceCredentials.sm_url}/v1/service_instances?fieldQuery=${encodedQuery}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            message: error.description
        }
    }

    const data = await response.json();
    return data.items[0];
}

async function getServiceBindingsByName(serviceCredentials, name, token) {
    const query = `name eq '${name}'`;
    const encodedQuery = encodeURIComponent(query);
    const url = `${serviceCredentials.sm_url}/v1/service_bindings?fieldQuery=${encodedQuery}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.items[0];
    } catch (error) {
        console.error("Error fetching service bindings:", error.message);
        throw error;
    }
}

module.exports = {
    createServiceInstance,
    createServiceBinding,
    deleteServiceInstance,
    deleteServiceBinding,
    registerServiceBroker,
    deleteServiceBroker,
    getServiceBroker
};
