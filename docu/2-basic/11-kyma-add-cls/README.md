# Kyma - Obeservability with Cloud Logging Service

- **Kyma** ✅ 
- **Cloud Foundry** ❌

**Important** - This part of the tutorial is required for **Kyma** deployments only!

## 1. Introduction to SAP Cloud Logging Service
[SAP Cloud Logging](https://discovery-center.cloud.sap/index.html#/serviceCatalog/cloud-logging) service is an instance-based observability service that builds upon OpenSearch to store, visualize, and analyze application logs, metrics, and traces from SAP BTP Cloud Foundry, Kyma, Kubernetes and other runtime environments. For Cloud Foundry and Kyma, it offers an easy integration by providing predefined contents to investigate load, latency, and error rates of the observed applications based on their requests and correlate them with additional data.

The SAP Cloud Logging service offers multiple service plans (e.g., Standard, Large, and Dev) to cater to different use cases and requirements. These plans provide different ingestion and storage capabilities. For example:
- Standard/Large plans are designed for production workloads, supporting higher data volumes and extended retention.
- Dev plan is only for non-production environments and evaluation purposes which lacks cloud qualities.

For more information, see the [SAP Cloud Logging](https://help.sap.com/docs/SAP_CLOUD_LOGGING/454331d80e3b42b1804d83a672cf098b/what-is-sap-cloud-logging?locale=en-US&state=PRODUCTION&version=Cloud) and its [plans](https://help.sap.com/docs/SAP_CLOUD_LOGGING/454331d80e3b42b1804d83a672cf098b/service-plans?locale=en-US&state=PRODUCTION&version=Cloud) documentation. You can also check the [service innovation guide](https://community.sap.com/t5/technology-blogs-by-sap/from-application-logging-to-cloud-logging-service-innovation-guide/ba-p/13938380) to understand the innovation journey from SAP Application Logging Service towards SAP Cloud Logging Service and its benefits.

## 2. Add Observability with Telemetry plugin
The [Telemetry (@cap-js/telemetry) plugin](https://github.com/cap-js/telemetry) provides observability features such as tracing and metrics, including [automatic OpenTelemetry instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/zero-code/). By enabling the plugin in your project, various kinds of telemetry data will be automatically collected.

Let's add the Telemetry plugin to the project and enable it by customizing few configurations. 

- Switch to **_code_** directory and install dependencies
  ```bash
  ## Run in ./code ##
  npm i @cap-js/telemetry @grpc/grpc-js @opentelemetry/exporter-metrics-otlp-grpc@0.57.2 @opentelemetry/exporter-trace-otlp-grpc@0.57.2 @opentelemetry/host-metrics @opentelemetry/exporter-logs-otlp-grpc@0.57.2
  ``` 
- Add following configuration under **_requires_** key in both [code/srv/.cdsrc.json](../../../code/srv/.cdsrc.json) and [code/api/.cdsrc.json](../../../code/api/.cdsrc.json) file folder.
  ```json
  "telemetry": {
    "[hybrid]": {
      "kind": "telemetry-to-cloud-logging"
    },
    "[local-with-mtx]": {
      "kind": "telemetry-to-console"
    },
    "[development]": {
      "kind": "telemetry-to-console"
    }
  }
  ```
- Test your application locally by following steps in [section 1](../../4-expert/local-hybrid-development/README.md#1-running-the-multitenant-application-locally-susaas-srv) to see the telemetry in the console.
- This should show traces and metrics data (also refferred to as signals) in the console as shown below:    

  - **_Traces_**:   
    Traces allow you to analyze how a request, message, task, etc. is being processed by your application. It provides a detailed view of the flow of the request and the time taken by each operation.    
    [<img src="./images/local-trace.png" width="750"/>](./images/local-trace.png?raw=true)    

  - **_Metrics_**:    
    Metrics are measurements captured at runtime. It helps you to understand health and performance of the application.   

    Out of the box, @cap-js/telemetry offers HTTP metric [http.server.duration](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestduration) which measures different values like minimum/maximum response time, total duration across requests, distribution of request durations etc. It helps analyze performance, detect bottlenecks, and optimize response times.      
    [<img src="./images/local-metrics-1.png" width="750"/>](./images/local-metrics-1.png?raw=true)     
    <br/>
    Additionally, @cap-js/telemetry instantiates and provides host metrics like cpu usage and memory usage etc ([@opentelemetry/host-metrics](https://www.npmjs.com/package/@opentelemetry/host-metrics)).       
    [<img src="./images/local-metrics-2.png" width="750"/>](./images/local-metrics-2.png?raw=true)

## 3. Deploy and Integrate to Cloud Logging.
- **Prepare for Deployment**
  - Ensure that you have installed following dependencies in your project (check in [code/package.json](../../../code/package.json)).
    ```bash
    ## Run in ./code ##
    npm i @cap-js/telemetry @grpc/grpc-js @opentelemetry/exporter-metrics-otlp-grpc@0.57.2 @opentelemetry/exporter-trace-otlp-grpc@0.57.2 @opentelemetry/host-metrics @opentelemetry/exporter-logs-otlp-grpc@0.57.2
    ```
  - Add following configuration under **_requires_** key in both [code/srv/srv/.cdsrc.json](../../../code/srv/srv/.cdsrc.json) and [code/api/srv/.cdsrc.json](../../../code/api/srv/.cdsrc.json) file.      
    ```json
    "telemetry": {
      "kind": "to-otlp"
    } 
    ```    
  - Enable otlp config under global in helm chart as shown below in [/charts/sustainable-saas/Values.yaml](../../../deploy/kyma/charts/sustainable-saas/values.yaml)
    ```yaml
    ## setting enabled: true ##
    otlp:
      metrics:
        enabled: true
        endpoint: http://telemetry-otlp-metrics.kyma-system.svc.cluster.local:4317
      traces:
        enabled: true
        endpoint: http://telemetry-otlp-traces.kyma-system.svc.cluster.local:4317
    ```
  - Build and Deploy your application.
- Enable telemetry module in your Kyma cluster. For details, see [Adding and Deleting a Kyma Module](https://help.sap.com/docs/btp/sap-business-technology-platform/enable-and-disable-kyma-module).
   [<img src="./images/telemetry-module.png" width="750"/>](./images/telemetry-module.png?raw=true)
- **Service Instance Creation / Binding**   
  There are multiple methods to create an instance of the SAP Cloud Logging service as follows.     
    - [Create an SAP Cloud Logging Instance through SAP BTP Cockpit](https://help.sap.com/docs/SAP_CLOUD_LOGGING/d82d23dc499c44079e1e779c1d3a5191/create-sap-cloud-logging-instance-through-sap-btp-cockpit)     
    - [Create an SAP Cloud Logging Instance through Cloud Foundry CLI](https://help.sap.com/docs/SAP_CLOUD_LOGGING/d82d23dc499c44079e1e779c1d3a5191/create-sap-cloud-logging-instance-through-cloud-foundry-cli)     
    - [Create an SAP Cloud Logging Instance through SAP BTP CLI](https://help.sap.com/docs/SAP_CLOUD_LOGGING/d82d23dc499c44079e1e779c1d3a5191/create-sap-cloud-logging-instance-through-sap-btp-cli)  
    - [Create an SAP Cloud Logging Instance through SAP BTP Service Operator](https://help.sap.com/docs/cloud-logging/cloud-logging/create-sap-cloud-logging-instance-through-sap-btp-service-operator?version=Cloud)

  Preferred approach for Kyma environment would be to use BTP Service Operator. It helps in creating necessary secrets and also telemetry module intelligently rortates and switches to new credentials without any action from developer.
  - [cls-instance-binding.yaml](../../../deploy/kyma/cls/cls-instance-binding.yaml)
    ```cmd
    ## Run in ./deploy/kyma ##
    kubectl apply -f ./cls/cls-instance-binding.yaml
    ```
- **Enable logging, tracing, metrices configurations in Kyma**  
  ```cmd
  ## Run in ./deploy/kyma ##
  kubectl apply -f ./cls/istio-trace-default.yaml
  kubectl apply -f ./cls/logpipeline-app-logs.yaml
  kubectl apply -f ./cls/logpipeline-istio-logs.yaml
  kubectl apply -f ./cls/tracepipeline-app-traces.yaml
  kubectl apply -f ./cls/metricpipeline-app-metrics.yaml
  ```