import xsenv from "@sap/xsenv";

import CfUtils from "./cf-utils.js";
import KymaUtils from "./kyma-utils.js";
import CredStore from "./credStore.js";

const cfUtils = new CfUtils();
const postgresql = new Object();

if (cds.env.profiles.find((p) => p.includes("hybrid") || p.includes("production"))) {
    try {
        Object.assign(postgresql, xsenv.getServices({ "postgresql-db": { label: "postgresql-db" } })["postgresql-db"]);
    } catch (error) {
        console.log("[cds] - Object Store Binding is missing!");
    }
}

class Terraform {
    static async createTenant(config) {
        try {
            const btpCreds = await this.#getBtpCredentials();

            const cmd = `export PG_CONN_STR=${postgresql.uri} && export PG_SCHEMA_NAME=${config.tenant} && 
                    terraform -chdir=app init && 
                    terraform -chdir=app apply -auto-approve
                        -var="password=${btpCreds.password}"
                        -var="username=${btpCreds.username}"
                        -var="globacct=${config.globacct}"
                        -var="region=${config.region}"
                        -var="tenant=${config.tenant}"
                        -var="application_idp=${config.applicationIdp}"
                        ${config.platformIdp ? `-var='platform_idp=${config.platformIdp}'` : ""}
+                       ${config.org ? `-var='org=${config.org}'` : ""}
                        ${config.space ? `-var='space=${config.space}'` : ""}
                        ${config.shootName ? `-var='shootname=${config.shootName}'` : ""}
                        ${config.namespace ? `-var='namespace=${config.namespace}'` : ""}
                        ${config.parentDir ? `-var='parent_dir=${config.parentDir}'` : ""}
                        ${config.viewerRole ? `-var='viewer_role=${config.viewerRole}'` : ""}
                        ${config.subaccountAdmins ? `-var='subaccount_admins=${config.subaccountAdmins}'` : ""}
                        ${config.saasAdmins ? `-var='saas_admins=${config.saasAdmins}'` : ""}
                        ${config.appName ? `-var="app_name=${config.appName}"` : ""}
                        ${config.appPlan ? `-var="app_plan=${config.appPlan}"` : ""}
                        ${config.apiName ? `-var="api_name=${config.apiName}"` : ""}
                        ${config.apiPlan ? `-var="api_plan=${config.apiPlan}"` : ""}`;

            if (process.env.VCAP_APPLICATION) {
                await cfUtils.initialize();
                await cfUtils.runTask(process.env.terraformName, cmd.replace(/(\r\n|\n|\r)/gm, ""), config.tenant);
            } else {
                await KymaUtils.runJob(cmd.replace(/(\r\n|\n|\r)/gm, ""), config.tenant);
            }

            console.log(`Tenant Onboarding successfully started`);
            return `Tenant Onboarding successfully started`;
        } catch (error) {
            console.error("Error: Tenant Onboarding could not be started");
            console.error(error.message);
        }
    }

    static async deleteTenant(config) {
        try {
            const btpCreds = await this.#getBtpCredentials();

            const cmd = `export PG_CONN_STR=${postgresql.uri} && export PG_SCHEMA_NAME=${config.tenant} && 
                  terraform -chdir=app init && 
                  terraform -chdir=app destroy -auto-approve
                  -var="password=${btpCreds.password}"
                  -var="username=${btpCreds.username}"
                  -var="globacct=${config.globacct}"
                  -var="region=${config.region}"
                  -var="tenant=${config.tenant}"
                  -var="application_idp=${config.applicationIdp}"
                  ${config.platformIdp ? `-var='platform_idp=${config.platformIdp}'` : ""}
                  ${config.org ? `-var='org=${config.org}'` : ""}
                  ${config.space ? `-var='space=${config.space}'` : ""}
                  ${config.shootName ? `-var='shootname=${config.shootName}'` : ""}
                  ${config.namespace ? `-var='namespace=${config.namespace}'` : ""}`;

            if (process.env.VCAP_APPLICATION) {
                await cfUtils.initialize();
                await cfUtils.runTask(process.env.terraformName, cmd.replace(/(\r\n|\n|\r)/gm, ""), config.tenant);
            } else {
                await KymaUtils.runJob(cmd.replace(/(\r\n|\n|\r)/gm, ""), config.tenant);
            }

            console.log(`Tenant Offboarding successfully started`);
            return `Tenant Offboarding successfully started`;
        } catch (error) {
            console.error("Error: Tenant Offboarding could not be started");
            console.error(error.message);
        }
    }

    static async #getBtpCredentials() {
        try {
            const credentials = new Object();

            // If Kyma environment or if provided in env variables, use env variables
            if (!process.env.VCAP_APPLICATION || (process.env["BTP_ADMIN_USER"] && process.env["BTP_ADMIN_PASSWORD"])) {
                Object.assign(credentials, {
                    username: process.env["BTP_ADMIN_USER"],
                    password: process.env["BTP_ADMIN_PASSWORD"]
                });
                console.log("Credentials successfully fetched from Environment Variables");
                // If Cloud Foundry and not provided in env variables try Credential Store
            } else {
                const btpAdminUser = await CredStore.readCredential("susaas", "password", "btp-admin-user");
                Object.assign(credentials, {
                    username: btpAdminUser.username,
                    password: btpAdminUser.value
                });
                console.log("Credentials successfully retrieved from Credential Store");
            }
            return credentials;
        } catch (error) {
            console.error(`Error: Unable to retrieve credentials for SAP BTP Admin User`);
            console.error(`Error: ${error.message}`);
            throw error;
        }
    }
}

export default Terraform;
