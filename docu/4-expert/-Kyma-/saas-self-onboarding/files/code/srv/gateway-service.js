const cds = require('@sap/cds');
const crypto = require('crypto');

const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromCluster();
const k8sCustObjApi = kc.makeApiClient(k8s.CustomObjectsApi);

// Environment variables required to handle onboarding and to build unique tenantIds
const kymaNamespace = process.env["KYMA_NAMESPACE"];
const clusterShootname = process.env["CLUSTER_SHOOTNAME"];

// Release name of SaaS app to be onboarded
const saasHelmRelease = process.env["SAAS_HELM_RELEASE"];

module.exports = cds.service.impl(async function () {

    // Called after SAP IAS authentication from Home-Screen or when user wants to access tenant from Onboarding-Screen
    this.on("redirect", async (req)=> {
        try {
            if (!req.user) { return req.error(404, 'Error: Missing User Details') };
            if (!req.user.attr?.scim_id) { return req.error(404, 'Error: Missing User Details') };

            const scimId = req.user.attr.scim_id;
            // Unique sha256 hash value build to identify a tenant
            const tenantId = crypto.createHash('shake256', { outputLength: 10 }).update(`${saasHelmRelease}-${kymaNamespace}-${clusterShootname}-${scimId}`).digest('hex');
            // Tenant exists if API rule for tenant exists
            const result = await k8sCustObjApi.listNamespacedCustomObject('gateway.kyma-project.io','v1beta1',kymaNamespace,'apirules','',false,'','','app.sap.com/subdomain=' + encodeURI(tenantId));

            // If no tenant exists for user, potential x-custom-host cookie deleted and user forwarded to onboarding UI
            if (!result.body.items || result.body.items?.length == 0){ 
                if (req._.req.cookies["x-custom-host"]){
                    req._.res.clearCookie("x-custom-host", { httpOnly: false })
                }
                return req._.res.redirect('/sapsusaasuionboarding/') 
            }

            // If tenant exists, check if x-custom-host cookie is set
            const cookie = req._.req.cookies ? req._.req.cookies["x-custom-host"] : undefined;

            // If cookie is not set, set new x-custom-host cookie containing the tenantId
            if (cookie === undefined) { 
                req._.res.cookie('x-custom-host', tenantId, { maxAge: 1*24*60*60*1000, httpOnly: false });
                console.log('Info: Cookie x-custom-host created successfully');
            }

            // Redirect user to SaaS application 
            req._.res.redirect('/sapsusaasuipublicflp/');

        } catch(error) {
            console.error(`Error: Error during post-login process: ${JSON.stringify(error)}`);
            return req.error(500, `Error during post-login process: ${error.message}`);
        };
    });
});
