import k8s from "@kubernetes/client-node";
const kc = new k8s.KubeConfig();

// Environment variables required to handle onboarding and to build unique tenantIds
const kymaNamespace = process.env["KYMA_NAMESPACE"];

if (process.env.NODE_ENV === 'production') {
    kc.loadFromCluster();
} else {
    kc.loadFromDefault();
}

const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);

class KymaUtils {

  static async getJobs(jobName = undefined) {
    try {
      let jobs = await k8sBatchV1Api.listNamespacedJob(kymaNamespace);
      
      if(jobName){
        jobs = jobs.body.items.filter((job) => job.metadata.name.startsWith(jobName));
      }

      console.log("Kyma Jobs successfully read");
      return jobs ?? [];
    } catch (error) {
      console.error(`Error: Cannot read Kyma Jobs`);
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }

  static async runJob(command, jobName = undefined) {
    console.log("#SECRET", process.env["IMAGE_PULL_SECRET"])
    try {
      const jobResult = await k8sBatchV1Api.createNamespacedJob(kymaNamespace, {
        apiVersion: "batch/v1",
        kind: "Job",
        metadata: { name: jobName },
        spec: {
          ttlSecondsAfterFinished: 10,
          template: {
            metadata: {
              name: "terraform",
              annotations: { "sidecar.istio.io/inject": "false" },
            },
            spec: Object.assign(process.env["IMAGE_PULL_SECRET"] ? {
              imagePullSecrets: [
                {
                  "name": process.env["IMAGE_PULL_SECRET"]
                }
              ]
              } : {},{
              restartPolicy: "Never",
              containers: [
                {
                  image: process.env["OBD_TERRAFORM_IMAGE"],
                  name: "terraform",
                  command: [
                    "/bin/sh", 
                    "-ec",
                    "cd ../ && " + command,
                  ]
                },
              ],
            }),
          },
        },
      });

      console.log("Kyma Job started successfully");
      return jobResult.body;
    } catch (error) {
      console.error(`Error: Cannot run Kyma Job`);
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }
}

export default KymaUtils;
