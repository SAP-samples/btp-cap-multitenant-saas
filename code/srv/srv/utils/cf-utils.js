const axios = require('axios');
const cfenv = require('cfenv');

const { getAppEnv } = cfenv;
const appEnv = getAppEnv();
const cds = require('@sap/cds')
const Logger = cds.log('cf-utils')
class CfUtils {

    async login(username, password) {
        try {
            let optionsInfo = {
                method: 'GET',
                url: appEnv.app.cf_api + '/info'
            };

            let cfInfo = await axios(optionsInfo);

            let loginEndpoint = cfInfo.data.authorization_endpoint;
            let tokenEndpoint = loginEndpoint + '/oauth/token';
            let optionsLogin = {
                method: 'POST',
                url: tokenEndpoint,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic Y2Y6'
                },
                data: new URLSearchParams({
                    grant_type: 'password',
                    username: username,
                    password: password
                }).toString()
            }
            let loginResponse = await axios(optionsLogin);
            this.token = loginResponse.data.access_token
            Logger.log(`Login to CF with user ${username} successful`);
            return loginResponse.data.access_token;
        } catch (error) {
            Logger.error(`Error: Can not login to CF with user ${username}`);
            Logger.error(error.message);
        }
    }

    async getAppDomainInfo(appname) {
        try {
            let options1 = {
                method: 'GET',
                url: appEnv.app.cf_api + '/v3/apps?organization_guids=' + appEnv.app.organization_id + '&space_guids=' + appEnv.app.space_id + '&names=' + appname,
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            };
            let res1 = await axios(options1);
            let options2 = {
                method: 'GET',
                url: appEnv.app.cf_api + '/v3/domains?names=' + /\.(.*)/gm.exec(appEnv.app.application_uris[0])[1],
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            };
            // get domain GUID
            let res2 = await axios(options2);
            let results = {
                'app_id': res1.data.resources[0].guid,
                'domain_id': res2.data.resources[0].guid
            };
            Logger.log(`Domain info for ${appname} successfully retrieved`);
            return results;
        } catch (error) {
            Logger.error(`Error: Can get domain info for app ${appname}`);
            Logger.error(error.message);
        }
    };

    async createRoute(tenantHost, appname) {
        try {
            let appDomainInfo = await this.getAppDomainInfo(appname);
            let options = {
                method: 'POST',
                url: appEnv.app.cf_api + '/v3/routes',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                data: {
                    'host': tenantHost,
                    'relationships': {
                        'space': {
                            'data': {
                                'guid': appEnv.app.space_id
                            }
                        },
                        'domain': {
                            'data': {
                                'guid': appDomainInfo.domain_id
                            }
                        }
                    }
                }
            }
            let res1 = await axios(options);

            let optionsApp = {
                method: 'POST',
                url: appEnv.app.cf_api + '/v3/routes/' + res1.data.guid + '/destinations',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                data: {
                    'destinations': [{
                        'app': {
                            'guid': appDomainInfo.app_id
                        }
                    }]
                }
            }

            let res2 = await axios(optionsApp)
            Logger.log(`Route for ${tenantHost} successfully created`);
            return res2.data;
        } catch (error) {
            Logger.error("Error: Route can not be created for ", tenantHost);
            Logger.error(error.message);
        }
    };

    async deleteRoute(tenantHost, appname) {
        try {
            let appDomainInfo = await this.getAppDomainInfo(appname);
            let route = await this.getAppRoute(appDomainInfo.app_id, tenantHost);
            let options = {
                method: 'DELETE',
                url: appEnv.app.cf_api + '/v3/routes/' + route.resources[0].guid,
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            };
            let response = await axios(options)
            Logger.log(`Route for ${tenantHost} successfully deleted`);
            return response.data;
        } catch (error) {
            Logger.error("Error: Route can not be deleted for ", tenantHost);
            Logger.error(error.message);
        }
    }
    
    async getAppRoute(appId, tenantHost) {
        try {
            let options = {
                method: 'GET',
                url: appEnv.app.cf_api + '/v3/apps/' + appId + '/routes',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                params: {
                    hosts : tenantHost
                }
            };
            let response = await axios(options);
            if (response.data.pagination.total_results === 1) {
                return response.data;
            } else {
                Logger.error(`Error: Route for app ${appId} and host ${tenantHost} can not be found`);
                throw new Error(`Error: Route for app ${appId} and host ${tenantHost} can not be found`)
            }
        } catch (error) {
            Logger.error("Error: Can not find the route")
            Logger.error(error.message);
        }
    }
}
module.exports = CfUtils