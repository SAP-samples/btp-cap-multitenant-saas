const crypto = require('crypto');
const k8s = require('@kubernetes/client-node');
const cds = require('@sap/cds');
const Logger = cds.log('tenant-automator');
const kc = new k8s.KubeConfig();
kc.loadFromCluster()
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

const routerName = process.env["ROUTER_NAME"],
      routerPort = process.env["ROUTER_PORT"],
      kymaGateway = process.env["KYMA_GATEWAY"],
      kymaNamespace = process.env["KYMA_NAMESPACE"],
      helmRelease = process.env["HELM_RELEASE"],
      clusterDomain = process.env["CLUSTER_DOMAIN"],
      apiRuleGroup = process.env["KYMA_APIRULE_GROUP"],
      apiRuleVersion = process.env["KYMA_APIRULE_VERSION"],
      apiRulePlural = process.env["KYMA_APIRULE_PLURAL"];

async function deleteApiRule(apiRuleTempl) {
    try {
        const result = await k8sApi.deleteNamespacedCustomObject(
            apiRuleGroup,
            apiRuleVersion,
            kymaNamespace,
            apiRulePlural,
            apiRuleTempl.metadata.name
        );

        if (result.response.statusCode == 200) {
            Logger.debug("Success: API Rule deleted!");
        }else if(result.response.statusCode==404){
            Logger.debug('Not found, but ok..')
        }
    } catch (error) {
        if(error.statusCode == 404){
            Logger.warn(`API Rule already deleted: ${error.message}`);
            return 
        }else{
            throw {
                message:error.response.body? error.response.body.message : 'error during API Rule deletion'
            }
        }
    }
}

async function createApiRule(apiRuleTempl) {
    try {
        const result = await k8sApi.getNamespacedCustomObject(
            apiRuleGroup,
            apiRuleVersion,
            kymaNamespace,
            apiRulePlural,
            apiRuleTempl.metadata.name
        );

        if (result.response.statusCode == 200) {
            Logger.debug(`${apiRuleTempl.metadata.name} already exists.`);
        }
    } catch (error) {

        // Create API Rule if does not exist
        Logger.warn(`${apiRuleTempl.metadata.name} does not exist. Creating a new one.`);

        try {
            const createResult = await k8sApi.createNamespacedCustomObject(
                apiRuleGroup,
                apiRuleVersion,
                kymaNamespace,
                apiRulePlural,
                apiRuleTempl
            );

            if (createResult.response.statusCode == 201) {
                Logger.debug("API Rule created!");
            }
        } catch (error) {
            throw error;
        }
    }
}

function getApiRuleTmpl(subdomain, custSubdomain = null) {
    try {
        const access_strategy = {
            path: '/*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
            noAuth: true,
            mutators: [{
                handler: 'header',
                config: {
                    headers: {
                        "x-custom-host": `${subdomain}-${routerName}-${kymaNamespace}.${clusterDomain}`,
                    }
                }
            }]
        };

        const host = (custSubdomain && custSubdomain !== '') ? custSubdomain
            : `${subdomain}-${routerName}-${kymaNamespace}`;

        const uuid = crypto.createHash('sha1').update(subdomain).digest('hex').slice(0, 5);

        const apiRuleTemplate = {
            apiVersion: `${apiRuleGroup}/${apiRuleVersion}`,
            kind: 'APIRule',
            metadata: {
                name: `${helmRelease}-tenant-${uuid}`,
                labels: {
                    "app.kubernetes.io/name": `${helmRelease}-tenant-${uuid}`,
                    "app.kubernetes.io/instance": helmRelease,
                    "app.sap.com/subdomain": subdomain
                }
            },
            spec: {
                gateway: kymaGateway,
                hosts: [`${host}.${clusterDomain}`],
                service: {
                    name: routerName,
                    port: parseInt(routerPort),
                },
                rules: [access_strategy]
            }
        };

        Logger.debug("API Template: " + JSON.stringify(apiRuleTemplate));

        return apiRuleTemplate;
    } catch (error) {
        throw error;
    }
}

module.exports = { deleteApiRule, createApiRule, getApiRuleTmpl };
