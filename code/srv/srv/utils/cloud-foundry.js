const cfenv = require('cfenv');
const { getAppEnv } = cfenv;
const appEnv = getAppEnv();
const cds = require('@sap/cds');
const Logger = cds.log('tenant-automator');

let token = null;

async function login(username, password) {
    try {
        // Get CF API info
        const cfInfoResponse = await fetch(`${appEnv.app.cf_api}/info`);
        const cfInfo = await cfInfoResponse.json();

        // Extract token endpoint
        const loginEndpoint = cfInfo.authorization_endpoint;
        const tokenEndpoint = `${loginEndpoint}/oauth/token`;
        const origin = process.env.IDP_ORIGIN || "sap.ids"
        // Request login token
        const loginHint = encodeURIComponent(`{"origin":"${origin}"}`)
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic Y2Y6'
            },
            body: new URLSearchParams({
                login_hint: loginHint,
                grant_type: 'password',
                username,
                password
            }).toString()
        });
        if (!response.ok) {
            const error = await response.json()
            throw {
                message: `${response.status}:${error.error_description}`
            }
        }
        const loginData = await response.json();
        token = loginData.access_token;

        Logger.debug(`Login to CF with user ${username} successful`);
        return token;
    } catch (error) {
        Logger.debug(`Error: Can not login to CF with user ${username}`);
        throw error
    }
}

async function getAppDomainInfo(appname) {
    try {
        // Fetch app details
        const appDetailsResponse = await fetch(`${appEnv.app.cf_api}/v3/apps?organization_guids=${appEnv.app.organization_id}&space_guids=${appEnv.app.space_id}&names=${appname}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!appDetailsResponse.ok) {
            throw {
                message: `CF Domain can not be retrieved: ${response.status}-${response.statusText}`
            }
        }
        const appDetails = await appDetailsResponse.json();

        // Fetch domain details
        const domainResponse = await fetch(`${appEnv.app.cf_api}/v3/domains?names=${/\.(.*)/.exec(appEnv.app.application_uris[0])[1]}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!domainResponse.ok) {
            throw {
                message: `CF Domain can not be retrieved: ${response.status}-${response.statusText}`
            }
        }
        const domainDetails = await domainResponse.json();

        return {
            app_id: appDetails.resources[0].guid,
            domain_id: domainDetails.resources[0].guid
        };
    } catch (error) {
        Logger.debug(`Error: Can not get domain info for app ${appname}`);
        throw error
    }
}

async function createRoute(tenantHost, appname, token) {
    try {
        const appDomainInfo = await getAppDomainInfo(appname);

        // Create the route
        const routeResponse = await fetch(`${appEnv.app.cf_api}/v3/routes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                host: tenantHost,
                relationships: {
                    space: {
                        data: { guid: appEnv.app.space_id }
                    },
                    domain: {
                        data: { guid: appDomainInfo.domain_id }
                    }
                }
            })
        });
        const routeData = await routeResponse.json();

        // Associate the route with the app
        const appRouteResponse = await fetch(`${appEnv.app.cf_api}/v3/routes/${routeData.guid}/destinations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                destinations: [{
                    app: {
                        guid: appDomainInfo.app_id
                    }
                }]
            })
        });

        const appRouteData = await appRouteResponse.json();
        Logger.debug(`Route for ${tenantHost} successfully created`);
        return appRouteData;
    } catch (error) {
        Logger.debug("Error: Route cannot be created for " + tenantHost);
        throw error
    }
}

async function deleteRoute(tenantHost, appname, token) {
    try {
        const appDomainInfo = await getAppDomainInfo(appname);
        const route = await getAppRoute(appDomainInfo.app_id, tenantHost);
        if(!route) return

        const deleteRouteResponse = await fetch(`${appEnv.app.cf_api}/v3/routes/${route.resources[0].guid}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!deleteRouteResponse.ok) {
            throw {
                message: `${response.status}-${response.statusText}`
            }
        }else{
            Logger.debug(`Route for ${tenantHost} successfully deleted`);
            return
        }
    } catch (error) {
        Logger.debug(`Error: Route cannot be deleted for ${tenantHost}`);
        throw error
    }
}

async function getAppRoute(appId, tenantHost) {
    try {
        const routeResponse = await fetch(`${appEnv.app.cf_api}/v3/apps/${appId}/routes?hosts=${tenantHost}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const routeData = await routeResponse.json();
        if (routeData.pagination.total_results === 1) {
            return routeData;
        } else {
            Logger.debug(`route for app ${appId} and host ${tenantHost} cannot be found`);
           // throw new Error(`Error: Route for app ${appId} and host ${tenantHost} cannot be found`);
        }
    } catch (error) {
        Logger.debug("route can not bef found for host:",tenantHost);
        return
    }
}

module.exports = { login, getAppDomainInfo, createRoute, deleteRoute, getAppRoute };
