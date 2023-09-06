import axios from "axios";
import cfenv from "cfenv";
import CredStore from "./credStore.js";

const { getAppEnv } = cfenv;
const appEnv = getAppEnv();

class CfUtils {
    username;
    password;
    token;

    async initialize() {
        await this.#readCfCredentials();
        await this.#login();
    }

    async getAppInfo(appname) {
        try {
            let options1 = {
                method: "GET",
                url:
                    appEnv.app.cf_api +
                    "/v3/apps?organization_guids=" +
                    appEnv.app.organization_id +
                    "&space_guids=" +
                    appEnv.app.space_id +
                    "&names=" +
                    appname,
                headers: {
                    Authorization: "Bearer " + this.token
                }
            };

            let res = await axios(options1);
            let results = {
                app_guid: res.data.resources[0].guid
            };
            console.log(`App info for ${appname} successfully retrieved`);
            return results;
        } catch (error) {
            console.error(`Error: Can get app info for app ${appname}`);
            console.error(error.message);
        }
    }

    async runTask(appname, command, taskName = null) {
        try {
            const appInfo = await this.getAppInfo(appname);
            const options = {
                method: "POST",
                url: appEnv.app.cf_api + "/v3/apps/" + appInfo.app_guid + "/tasks",
                headers: {
                    Authorization: "Bearer " + this.token,
                    "Content-type": "application/json"
                },
                data: Object.assign({ command: command }, taskName === null ? null : { name: taskName })
            };

            console.log(options);
            const response = await axios(options);

            console.log(`Task executed successfully`);
            return response.data;
        } catch (error) {
            console.error(`Error: Cannot execute Task`);
            console.error(error.message);
        }
    }

    async getTasks(taskName = null) {
        try {
            let options = {
                method: "GET",
                url:
                    appEnv.app.cf_api +
                    "/v3/tasks?organization_guids=" +
                    appEnv.app.organization_id +
                    "&space_guids=" +
                    appEnv.app.space_id +
                    "&order_by=-created_at" +
                    (taskName ? "&names=" + taskName : ""),
                headers: {
                    Authorization: "Bearer " + this.token
                }
            };

            let response = await axios(options);

            console.log(`Task fetched successfully`);
            return response.data.resources;
        } catch (error) {
            console.error(`Error: Cannot fetch Task`);
            console.error(error.message);
        }
    }

    async getAppRoute(appId, tenantHost) {
        try {
            let options = {
                method: "GET",
                url: appEnv.app.cf_api + "/v3/apps/" + appId + "/routes",
                headers: {
                    Authorization: "Bearer " + this.token
                },
                params: {
                    hosts: tenantHost
                }
            };
            let response = await axios(options);
            if (response.data.pagination.total_results === 1) {
                return response.data;
            } else {
                console.error(`Error: Route for app ${appId} and host ${tenantHost} can not be found`);
                throw new Error(`Error: Route for app ${appId} and host ${tenantHost} can not be found`);
            }
        } catch (error) {
            console.error("Error: Can not find the route");
            console.error(error.message);
        }
    }

    async #login() {
        try {
            const optionsInfo = {
                method: "GET",
                url: appEnv.app.cf_api + "/info"
            };

            const cfInfo = await axios(optionsInfo);

            const loginEndpoint = cfInfo.data.authorization_endpoint;
            const tokenEndpoint = loginEndpoint + "/oauth/token";
            const optionsLogin = {
                method: "POST",
                url: tokenEndpoint,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic Y2Y6"
                },
                data: new URLSearchParams(
                    Object.assign(
                        {
                            grant_type: "password",
                            username: this.username,
                            password: this.password
                        },
                        process.env["CF_LOGIN_HINT"]
                            ? { login_hint: encodeURIComponent(process.env["CF_LOGIN_HINT"]) }
                            : ""
                    )
                ).toString()
            };

            const res = await axios(optionsLogin);
            this.token = res.data.access_token;

            console.log(`Login to Cloud Foundry with user ${this.username} successful`);
        } catch (error) {
            console.error(`Error: Can not login to Cloud Foundry with user ${this.username}`);
            console.error(`Error: ${error.message}`);
            throw error;
        }
    }

    async #readCfCredentials() {
        try {
            // If provided in env variables, use env variables
            if (process.env["BTP_ADMIN_USER"] && process.env["BTP_ADMIN_PASSWORD"]) {
                this.username = process.env["BTP_ADMIN_USER"];
                this.password = process.env["BTP_ADMIN_PASSWORD"];
                console.log("Credentials successfully fetched from Environment Variables");

                // If not provided in env variables try Credential Store
            } else {
                const btpAdminUser = await CredStore.readCredential("susaas", "password", "btp-admin-user");
                this.username = btpAdminUser.username;
                this.password = btpAdminUser.value;
                console.log("Credentials successfully retrieved from Credential Store");
            }
        } catch (error) {
            console.error(`Error: Unable to retrieve credentials for SAP BTP Admin User`);
            console.error(`Error: ${error.message}`);
            throw error;
        }
    }
}

export default CfUtils;
