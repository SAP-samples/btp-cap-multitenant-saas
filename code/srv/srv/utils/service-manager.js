import axios from 'axios';
import TokenUtils from './token-utils.js';

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

            console.log(`Service instance successfully created for ${serviceOffering}-${servicePlan}`);
            return response.data;
        } catch (error) {
            console.error(`Error: Service instance can not be created for ${serviceOffering}-${servicePlan}`);
            console.error(`Error: ${error.message}`)
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

            console.log(`Service binding created for ${serviceInstanceId}`);
            return response.data;
        } catch (error) {
            console.error(`Error: Service binding can not be created for ${serviceInstanceId}`);
            console.error(`Error: ${error.message}`)
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

            console.log(`Service instance ${serviceInstanceId} successfully deleted`);
            return response.data;
        } catch (error) {
            console.error(`Error: Service instance can not be deleted`);
            console.error(`Error: ${error.message}`)
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

            console.log(`Service binding ${serviceBindingId} successfully deleted`);
            return response.data;
        } catch (error) {
            console.error(`Error: Service binding can not be deleted`);
            console.error(`Error: ${error.message}`)
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

            console.log(`Successfully retrieved service bindings for ${tenant}`);
            return response.data.items;
        } catch (error) {
            console.error("Error: Can not retrieve service bindings")
            console.error(`Error: ${error.message}`)
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
            console.error("Error: Unable to get a token for Service Manager");
            console.error(`Error: ${error.message}`)
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

            console.log(`Service Broker ${name} successfully created`);
            return response.data;
        } catch (error) {
            console.error("Error: Service Broker can not be created");
            console.error(`Error: ${error.message}`)
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

            console.log(`Service Broker ${serviceBrokerId} successfully deleted`);
            return response.data;
        } catch (error) {
            console.error("Error: Service Broker can not be deleted");
            console.error(`Error: ${error.message}`)
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

            console.log(`Service Broker ${name} successfully retrieved`);
            return response.data.items[0];
        } catch (error) {
            console.error("Error: Unable to retrieve Service Broker");
            console.error(`Error: ${error.message}`)
            throw error;
        }
    }
}

export default ServiceManager;