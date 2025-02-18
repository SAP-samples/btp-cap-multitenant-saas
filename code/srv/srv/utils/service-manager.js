const axios = require('axios') ;
const TokenUtils = require('./token-utils.js') ;
const cds = require('@sap/cds') 
const Logger = cds.log('sm-utils')
class ServiceManager {
    tokenStore = new Object()
    
    constructor(serviceCredentials) {
        this.creds = serviceCredentials;
    }

    async createServiceInstance(serviceName, serviceOffering, servicePlan) {
        try {
            let body = {
                name: serviceName,
                service_offering_name: serviceOffering,
                service_plan_name: servicePlan
            };
            let token = await this.getToken();
            let optionsInstance = {
                method: 'POST',
                url: this.creds.sm_url + `/v1/service_instances`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                data: JSON.stringify(body)
            };
            let response = await axios(optionsInstance);

            Logger.log(`Service instance successfully created for ${serviceOffering}-${servicePlan}`);
            return response.data;
        } catch (error) {
            Logger.error(`Error: Service instance can not be created for ${serviceOffering}-${servicePlan}`);
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async createServiceBinding(serviceInstanceId, subscribingSubdomain) {
        try {
            let token = await this.getToken();
            let options = {
                method: 'POST',
                url: this.creds.sm_url + `/v1/service_bindings`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                data: JSON.stringify({ name: subscribingSubdomain, service_instance_id: serviceInstanceId })
            };
            let response = await axios(options);

            Logger.log(`Service binding created for ${serviceInstanceId}`);
            return response.data;
        } catch (error) {
            Logger.error(`Error: Service binding can not be created for ${serviceInstanceId}`);
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async deleteServiceInstance(serviceInstanceId) {
        try {
            let token = await this.getToken();
            let optionsInstance = {
                method: 'DELETE',
                url: this.creds.sm_url + `/v1/service_instances/${serviceInstanceId}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };
            let response = await axios(optionsInstance);

            Logger.log(`Service instance ${serviceInstanceId} successfully deleted`);
            return response.data;
        } catch (error) {
            Logger.error(`Error: Service instance can not be deleted`);
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async deleteServiceBinding(serviceBindingId) {
        try {
            let token = await this.getToken();
            let optionsInstance = {
                method: 'DELETE',
                url: this.creds.sm_url + `/v1/service_bindings/${serviceBindingId}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };
            let response = await axios(optionsInstance);

            Logger.log(`Service binding ${serviceBindingId} successfully deleted`);
            return response.data;
        } catch (error) {
            Logger.error(`Error: Service binding can not be deleted`);
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async getAllServiceBindings(tenant) {
        try {
            let token = await this.getToken();
            let optionsBinding = {
                method: 'GET',
                url: this.credss.sm_url + `/v1/service_bindings`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                params:{
                    label:`subaccount_id eq '${tenant}'`
                }
            }
            let response = await axios(optionsBinding);

            Logger.log(`Successfully retrieved service bindings for ${tenant}`);
            return response.data.items;
        } catch (error) {
            Logger.error("Error: Can not retrieve service bindings")
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async getToken() {
        try {
            if (!this.tokenStore.token) {
                let tokenEndpoint = this.creds.url + '/oauth/token';
                this.tokenStore.token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, this.creds.clientid, this.creds.clientsecret);
            }
            return this.tokenStore.token;
        } catch (error) {
            Logger.error("Error: Unable to get a token for Service Manager");
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async createServiceBroker(name, url, description, user, password) {
        let body = {
            name: name,
            broker_url: url,
            description: description,
            credentials: {
                basic: {
                    username: user,
                    password: password
                }
            }
        }
        try {
            let token = await this.getToken();
            let options = {
                method: 'POST',
                url: this.creds.sm_url + `/v1/service_brokers`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                data: JSON.stringify(body)
            };
            let response = await axios(options);

            Logger.log(`Service Broker ${name} successfully created`);
            return response.data;
        } catch (error) {
            Logger.error("Error: Service Broker can not be created");
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async deleteServiceBroker(serviceBrokerId) {
        try {
            let token = await this.getToken();
            let options = {
                method: 'DELETE',
                url: this.creds.sm_url + `/v1/service_brokers/${serviceBrokerId}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };
            let response = await axios(options);

            Logger.log(`Service Broker ${serviceBrokerId} successfully deleted`);
            return response.data;
        } catch (error) {
            Logger.error("Error: Service Broker can not be deleted");
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }

    async getServiceBroker(name){
        try {
            let token = await this.getToken();
            let options = {
                method: 'GET',
                url: this.creds.sm_url + `/v1/service_brokers`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                params: {
                    fieldQuery:`name eq '${name}'`
                }
            };
            let response = await axios(options);

            Logger.log(`Service Broker ${name} successfully retrieved`);
            return response.data.items[0];
        } catch (error) {
            Logger.error("Error: Unable to retrieve Service Broker");
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }
}

module.exports = ServiceManager;