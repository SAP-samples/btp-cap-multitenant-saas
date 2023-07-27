import crypto from 'crypto';
import k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromCluster();
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

class KymaUtils {
    
    constructor(subdomain, custSubdomain = null) {
        this.subdomain = subdomain;
        this.custSubdomain = custSubdomain;
    }

    async deleteApiRule(apiRuleTempl){
        try {
            const result = await k8sApi.deleteNamespacedCustomObject(
                apiRuleGroup,
                apiRuleVersion,
                kymaNamespace,
                apiRulePlural,
                apiRuleTempl.metadata.name 
            );

            if (result.response.statusCode == 200) {
                console.log("Success: API Rule deleted!");
            }
        } catch (error) {
            console.error("Error: API Rule deletion error!");
            console.error(`Error: ${error.message}`);
        }
    }

    async createApiRule(apiRuleTempl){
        try {
            const result = await k8sApi.getNamespacedCustomObject(
                apiRuleGroup,
                apiRuleVersion,
                kymaNamespace,
                apiRulePlural,
                apiRuleTempl.metadata.name 
            );

            if (result.response.statusCode == 200) {
                console.log(`${apiRuleTempl.metadata.name} already exists.`);
            }
        } catch (error) {

            // Create API Rule if does not non-exist
            console.warn(`${apiRuleTempl.metadata.name} does not exist. Creating a new one.`);
            
            try {
                const createResult = await k8sApi.createNamespacedCustomObject(
                    apiRuleGroup,
                    apiRuleVersion,
                    kymaNamespace,
                    apiRulePlural,
                    apiRuleTempl
                );

                if (createResult.response.statusCode == 201) {
                    console.log("API Rule created!");
                }
            } catch (error) {
                console.error("Error: Failed to create APIRule!");
                console.error(`Error: ${error.message}`);
            }
        }
    }

    getApiRuleTmpl() {
        try{
            const access_strategy = {
                path: '/.*',
                methods: ['GET','POST','PUT','PATCH','DELETE','HEAD'],
                accessStrategies: [{ handler: 'noop' }],
                mutators: [{
                    handler: 'header',
                    config: {
                        headers: {
                            "x-custom-host": `${this.subdomain}-${routerName}-${kymaNamespace}.${clusterDomain}`,
                        }
                    }
                }]
            };

            const host = (this.custSubdomain && this.custSubdomain !== '' ) ? this.custSubdomain 
                : `${this.subdomain}-${routerName}-${kymaNamespace}`;

            const uuid = crypto.createHash('sha1').update(this.subdomain).digest('hex').slice(0, 5);

            const apiRuleTemplate = {
                apiVersion: `${apiRuleGroup}/${apiRuleVersion}`,
                kind: 'APIRule',
                metadata: { 
                    name: `${helmRelease}-tenant-${uuid}`,
                    labels: {
                        "app.kubernetes.io/name": `${helmRelease}-tenant-${uuid}`,
                        "app.kubernetes.io/instance": helmRelease,
                        "app.sap.com/subdomain": this.subdomain
                    }
                }, 
                spec: {
                    gateway: kymaGateway,
                    host: `${host}.${clusterDomain}`,
                    service: {
                        name: routerName,
                        port: parseInt(routerPort),
                    },
                    rules: [access_strategy]
                }
            };

            console.log("API Template: " + JSON.stringify(apiRuleTemplate));

            return apiRuleTemplate;
        }catch(error){
            console.error("Error: API Rule cannot not be generated") 
            throw error;
        }
    }
}

export default KymaUtils