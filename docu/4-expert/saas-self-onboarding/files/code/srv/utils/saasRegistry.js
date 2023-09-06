import axios from "axios";
import xsenv from "@sap/xsenv";
import TokenUtils from "./token-utils.js";

const saasRegistry = new Object();

if (cds.env.profiles.find((p) => p.includes("hybrid") || p.includes("production"))) {
    try {
        const services = xsenv.filterServices((svc) => svc.label === "saas-registry" || svc.name === "saas-registry");
        Object.assign(saasRegistry, services[0]?.credentials);
    } catch (error) {
        console.log("[cds] - SaaS Registry Binding is missing!");
    }
}

class SaaSRegistry {
    static async getSubscriptions() {
        try {
            const token = await this.#getToken();

            const options = {
                method: "GET",
                url: saasRegistry.saas_registry_url + "/saas-manager/v1/application/subscriptions",
                headers: { Authorization: "Bearer " + token }
            };

            const res = await axios(options);

            console.log(`Info: Subscriptions successfully read from SaaS Registry`);
            return res.data.subscriptions;
        } catch (error) {
            console.error(`Error: Subscriptions cannot be read from SaaS Registry`);
            console.error(`Error: ${error.message}`);
            throw error;
        }
    }

    static async #getToken() {
        return await TokenUtils.getTokenWithClientCreds(
            saasRegistry.url + "/oauth/token",
            saasRegistry.clientid,
            saasRegistry.clientsecret
        );
    }
}

export default SaaSRegistry;
