import cds from "@sap/cds";
import crypto from "crypto";

import Terraform from "./utils/terraform.js";
import CfUtils from "./utils/cf-utils.js";
import KymaUtils from "./utils/kyma-utils.js";
import SaaSRegistry from "./utils/saasRegistry.js";
const cfUtils = new CfUtils();

export default cds.service.impl(async function () {
    this.on("READ", "Subscriptions", async (req) => {
        try {
            if (!req.user?.attr?.scim_id) {
                return req.error(404, "Error: Missing User Details");
            }

            const { id = null } = (req.params[0] = {});
            const tenantId = getTenantId(req.user.attr?.scim_id);

            const subscriptions = (await SaaSRegistry.getSubscriptions())
                .filter((sub) => sub.subdomain.includes(tenantId))
                .map((sub, index) => {
                    return {
                        id: index,
                        subaccountId: sub.subaccountId,
                        url: sub.url,
                        state: sub.state,
                        code: sub.code,
                        createdOn: sub.createdOn
                    };
                });

            return id !== null
                ? subscriptions[id]
                    ? subscriptions[id]
                    : req.error(404, `Subscription with Id ${id} not found`)
                : subscriptions.length > 0
                ? subscriptions
                : [];
        } catch (error) {
            console.error(`Error: Error reading Subscriptions: ${JSON.stringify(error)}`);
            return req.error(`Error reading Subscriptions: ${error.message}`);
        }
    });

    this.on("READ", "Tasks", async (req) => {
        try {
            if (!req.user?.attr?.scim_id) {
                return req.error(404, "Error: Missing User Details");
            }

            const { id = null } = (req.params[0] = {});
            const tenantId = getTenantId(req.user.attr?.scim_id);
            let tasks = [];

            // Cloud Foundry logic
            if (process.env.VCAP_APPLICATION) {
                await cfUtils.initialize();
                tasks = (await cfUtils.getTasks(tenantId)).map((task, index) => {
                    return {
                        id: index,
                        name: task.name,
                        state: task.state
                    };
                });

            // Kyma logic
            } else {
                tasks = (await KymaUtils.getJobs(tenantId)).map((job, index) => {
                    let state = "UNKNOWN";

                    const completions = job.spec.completions;
                    const succeededPods = job.status.succeeded;
                    const failedPods = job.status.failed;
                    const activePods = job.status.active;

                    failedPods !== undefined && failedPods > 0 && (state = "FAILED");
                    succeededPods !== undefined && succeededPods === completions && (state = "COMPLETED");
                    activePods !== undefined && activePods > 0 && (state = "RUNNING");

                    return {
                        id: index,
                        name: job.metadata.name,
                        state: state
                    };
                });
            }

            return id !== null
                ? tasks[id]
                    ? tasks[id]
                    : req.error(404, `Task with Id ${id} not found`)
                : tasks.length > 0
                ? tasks
                : [];
        } catch (error) {
            console.error(`Error: Error reading Tasks: ${JSON.stringify(error)}`);
            return req.error(`Error reading Tasks: ${error.message}`);
        }
    });

    this.on("onboardTenant", async (req) => {
        try {
            if (!req.user?.attr?.scim_id || !req.user?.attr?.email) {
                return req.error(404, "Error: Missing User Details");
            }

            const subaccAdmins = JSON.parse(process.env["OBD_SUBACCOUNT_ADMINS"] ?? '[]');
            const saasAdmins = JSON.parse(process.env["OBD_SAAS_ADMINS"] ?? '[]');
            saasAdmins.unshift(req.user.attr.email);

            Terraform.createTenant({
                // ##### Mandatory Parameters #######
                applicationIdp: process.env["OBD_APPLICATION_IDP"], 
                globacct: process.env["OBD_GLOBACCT"], 
                region: process.env["OBD_REGION"], 
                tenant: getTenantId(req.user.attr?.scim_id),

                // ##### Runtime Parameters #######
                org: process.env["OBD_ORG"] ?? null, // Cloud Foundry
                space: process.env["OBD_SPACE"] ?? null, // Cloud Foundry
                shootName: process.env["OBD_SHOOTNAME"] ?? null, // Kyma
                namespace: process.env["OBD_NAMESPACE"] ?? null, // Kyma

                // ##### Optional Parameters #######
                appName: process.env["OBD_APP_NAME"] ?? null, // default - susaas
                appPlan: process.env["OBD_APP_PLAN"] ?? null, // default - trial
                apiName: process.env["OBD_API_NAME"] ?? null, // default - susaas-api
                apiPlan: process.env["OBD_API_PLAN"] ?? null, // default - trial
                parentDir: process.env["OBD_PARENT_DIR"] ?? null, // default - null
                platformIdp: process.env["OBD_PLATFORM_IDP"] ?? null, // default - sap.default
                saasAdmins: saasAdmins.length > 0 ? JSON.stringify(saasAdmins) : null, // default - null
                subaccountAdmins: subaccAdmins.length > 0 ? JSON.stringify(saasAdmins) : null, // default - null
                viewerRole: process.env["OBD_VIEWER_ROLE"] ?? null, // default - null
            });

            return req.reply("Onboarding Started");
        } catch (error) {
            console.error(`Error: Error during tenant onboarding: ${JSON.stringify(error)}`);
            return req.error(404, `Error occurred during tenant onboarding: ${error.message}`);
        }
    });

    this.on("offboardTenant", async (req) => {
        try {
            if (!req.user?.attr?.scim_id || !req.user?.attr?.email) {
                return req.error(404, "Error: Missing User Details");
            }

            Terraform.deleteTenant({
                // ##### Mandatory Parameters #######
                applicationIdp: process.env["OBD_APPLICATION_IDP"], 
                globacct: process.env["OBD_GLOBACCT"], 
                region: process.env["OBD_REGION"], 
                tenant: getTenantId(req.user.attr?.scim_id),

                // ##### Runtime Parameters #######
                org: process.env["OBD_ORG"] ?? null, // Cloud Foundry
                space: process.env["OBD_SPACE"] ?? null, // Cloud Foundry
                shootName: process.env["OBD_SHOOTNAME"] ?? null, // Kyma
                namespace: process.env["OBD_NAMESPACE"] ?? null, // Kyma

                // ##### Optional Parameters #######
                platformIdp: process.env["OBD_PLATFORM_IDP"] ?? null // default - sap.default 
            });

            return req.reply("Offboarding Started");
        } catch (error) {
            console.error(`Error: Error during tenant offboarding: ${JSON.stringify(error)}`);
            return req.error(404, `Error occured during tenant offboarding: ${error.message}`);
        }
    });
});

function getTenantId(scim_id) {
    return encodeURI(crypto.createHash("shake256", { outputLength: 10 }).update(`${scim_id}`).digest("hex"));
}
