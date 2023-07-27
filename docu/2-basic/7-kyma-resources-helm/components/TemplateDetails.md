# Template Details

This chapter provides detailed information on the various Helm templates and corresponding Kyma and Kubernetes resources. If you are new to Helm and have not checked out the provided introduction yet, we strongly recommend to read the respective [Helm Charts](./HelmCharts.md) chapter first. While the subsequent [Resource Overview](./ResourceOverview.md) chapter describes the general purpose of the different Kyma and Kubernetes resource types, in this part of the tutorial, we cover the scenario-related usage of the various components.

- [Template Details](#template-details)
  - [1. Umbrella Chart](#1-umbrella-chart)
  - [2. API Service](#2-api-service)
  - [3. API Service Broker](#3-api-service-broker)
  - [4. Application Router](#4-application-router)
  - [5. SaaS Backend Service](#5-saas-backend-service)

Once again, you might find the following visualizations useful, as you will be able identify and allocate many of the described resources. 

**Architecture Diagram**

[<img src="./images/ResourceDetailsArch.png" width="600"/>](./images/ResourceDetailsArch.png?raw=true)

**Component Details**

[<img src="./images/KymaObjectsGeneral.png" width="600"/>](./images/KymaObjectsGeneral.png?raw=true)


The recommended way to deploy our Sustainable SaaS sample application is the usage of the provided Helm Umbrella Chart. Doing so, you can maintain all environment specific settings in one place (values.yaml) and deploy all Helm Subcharts using one single Helm installation. 


## 1. Umbrella Chart

The Umbrella Chart */charts/sustainable-saas* directory, allows you to conduct a Helm installation including all relevant components of the Sustainable SaaS sample application like Application Router, Backend Service, API Broker and API Service. Furthermore, it contains the templates for all required SAP BTP Service Instances, as well as Kubernetes Job templates for the SAP HANA and HTML5 Application Deployments. 

For a default installation, it is sufficient to update the **values.yaml** file ([values.yaml](../../../../deploy/kyma/charts/sustainable-saas/values.sample.yaml)) of the Helm Umbrella Chart with your own environment settings, before starting a Helm installation. Still, all required values are also available in the respective Subcharts. Therefore, it is also possible to install the different Subcharts like the Application Router or the Backend Service separately, by copying the properties from the Helm Umbrella Chart *values.yaml* file to the respective *values.yaml* files of the Subcharts. 

```sh
Chart.yaml          # Helm Umbrella Chart referencing all Subcharts
values.schema.json  # Schema definition for Values.yaml file
values.yaml         # values.yaml for Helm Umbrella Chart
xs-security.json    # Settings for XSUAA Service Instance
```

**Good to know**

- As most SAP BTP services (e.g. XSUAA) are used by multiple components of our application (e.g. Application Router and Backend Service), we defined the SAP BTP Service Instances on Umbrella Chart level. An alternative approach would be a separate Helm Subchart, being used to create the shared SAP BTP Service Instances. 

- While processing the XSUAA Service Instance template, Helm will read and include the provided *xs-security.json* configuration file. If you reference further configuration files in your *values.yaml*, you need to place the respective files next to your *values.yaml* file. 

****charts/sustainable-saas/templates****

The **templates** directory of the Helm Umbrella Chart contains templates for all SAP BTP Service Instances, as well as templates for our Kubernetes Jobs. Additionally, the directory contains some template helper files used by Helm. 

```sh
# Service Broker Secret definition        
broker_secret.yaml 
# SAP HANA HDI Container definition (Shared/Common Container)
com_hdi_container.yaml 
# SAP BTP - Destination Service definition           
destination.yaml
# SAP HANA Deployer (Shared/Common Container) Job definition      
hana_deployer_job.yaml
# HTML5 Repository Deployer Job definition        
html5_apps_deployer_job.yaml
# HTML5 Application Repository (Host Service) definition  
html5_apps_repo_host.yaml
# HTML5 Application Repository (Runtime Service) definition     
html5_apps_repo_runtime.yaml
# Cloud Identity Service (Application) definition     
identity.yaml
# Helm deployment message definition
NOTES.txt
# SAP BTP - SaaS Registry Service definition
saas_registry.yaml 
# SAP BTP - Service Manager (Subaccount Admin plan) Service definition
sm_admin.yaml 
# SAP BTP - Service Manager (Container plan) Service definition
sm_container.yaml
# SAP BTP - XSUAA Service definition (for SaaS App) 
xsuaa.yaml 
# SAP BTP - XSUAA Service definition (for SaaS API)
xsuaa_api.yaml
# Helm templating helper file
_deployment_helpers.tpl 
# Helm templating helper file
_helpers.tpl
# Helm templating helper file
_sapcp_helpers.tpl 
```

**Good to know**

- The SAP BTP Service Instance templates need to match the names of the services defined in the [**values.yaml file**](../../../../deploy/kyma/charts/sustainable-saas/values.sample.yaml) of the Umbrella Chart, whereas underscores are converted to hyphens automatically. For each Service Instance defined in the values.yaml file, a corresponding template file has to exist. Otherwise, the Service Instance is not being generated. 

- The **Broker Secret** automatically generates a Service Broker user and password upon deployment. Binding the Secret to the API Service Broker and the Backend Service allows simplified retrieval of these credentials at runtime.

    > **broker_secret.yaml**

    ```yaml
    apiVersion: v1
    kind: Secret
    type: Opaque
    data:
        # Broker user set to default value "broker-user"
        BROKER_USER : {{ "broker-user" | b64enc | quote }}
        # Broker password created as a random alpha numeric string of 32 characters length
        {{- $password := (randAlphaNum 32  | b64enc ) }}
        BROKER_PASSWORD : {{ $password | quote }}
    ``` 

- The Helm Job templates for deploying the UI5 apps to the HTML5 Application Repository ([click here](../../../../deploy/kyma/charts/sustainable-saas/templates/html5_apps_deployer_job.yaml)) and the shared data model to the HDI Container instance ([click here](../../../../deploy/kyma/charts/sustainable-saas/templates/hana_deployer_job.yaml.yaml)), are also part of the Helm Umbrella Chart templates.

- The Service Manager Instance (**Subaccount Admin** plan - [click here](../../../../deploy/kyma/charts/sustainable-saas/templates/sm_admin.yaml)) allows our sample application to create a so-called Cloud Management Service Instance (**Central** plan) at runtime ([click here](https://discovery-center.cloud.sap/serviceCatalog/cloud-management-service/?region=all) for details). This Service Instance created at runtime, is required to create Service Manager Instances in the Subscriber Subaccounts. These Service Manager Instances can then be used to register API Service Brokers in the Subscriber Subaccounts. 
    
    > **Important** - The default Service Manager Service Instance (**Operator Access** plan) - used by Kyma to create Service Instances in the Provider Subaccount - can unfortunately not be used to create the required CIS Central instance. 

- As already explained, each Service Instance defined in the *values.yaml* file requires a corresponding template in the *templates* folder. Most of these template files, simply include a template reference (*cap.service-instance*) defined in the *_helpers.tpl* helper file. This generic approach saves us from defining dedicated SAP BTP Service Instance templates for each SAP BTP Service Instance.

    > **sm_admin.yaml**
    ```yaml
    {{- include "cap.service-instance" . }}
    ```

    > **_helpers.tpl**

    ```yaml
    # Helm template for SAP BTP Service Instances
    {{- define "cap.service-instance" -}} 
    {{- $service := get .Values $key }}
    {{- if $service }}
        {{- if or (not (hasKey $service "enabled")) $service.enabled }}
            {{- $name := $key | replace "_" "-" }}
            {{- $serviceParameters := $service.parameters | default (dict) }}
        ...
        {{ end }}
    {{ end }}
    ```

- Some Services Instance templates like the SaaS Registry require a slightly more complex template file. This is required when any of the Service Instance parameters requires dynamic values like e.g., the Backend Service URI as part of the getDependencies parameter below. If these parameters contain dynamic components, they cannot be provided as part of the static *values.yaml* file.

    > **saas_registry.yaml**
    ```yaml
    {{- if (default dict .Values.multitenancy).enabled }}
        # Include additional service configurations
        {{- $srvHostFull := include "cap.deploymentHostFull" (
              merge (dict "name" "srv" "deployment" .Values.srv) . 
            ) 
        }}
        {{- $defaultAppUrls := dict
            "getDependencies" (
                print "https://" $srvHostFull "/-/cds/saas-provisioning/dependencies"
            )
            ...
        }}
        # Include default SAP BTP Service Instance template
        {{- include "cap.service-instance" (
              merge ( dict "defaultParameters" $defaultParameters ) .
            ) 
        }}
    {{ end }}
    ```

- Some SAP BTP Services Instances templates also use the so-called [Helm **tpl** function](#https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-tpl-function). The tpl feature allows us to use the Helm template syntax in the *values.yaml* file. One example is the Destination Service, which uses Helm template syntax within the *init_data* parameters (of the *values.yaml*). This allows us to inject the dynamic values like the Backend Service URI into the SAP BTP Destination Service Instance parameters.

    > **values.yaml**

    Using Helm templating syntax in the parameter values. 

    ```yaml
    destination:
      serviceOfferingName: destination
      servicePlanName: lite
      parameters:
        init_data:
          instance:
            destinations:
              - Name: srv-api
                URL: 'http://{{ include "cap.fullname" (
                        merge (dict "name" "srv" "deployment" .Values.srv ) . 
                      ) }}:{{ .Values.srv.port }}'
              ...
    ```

    > **destination.yaml**

    Sends the **init_data** parameters (containing Helm templating syntax) to a helper function.

    ```yaml
    {{- if (default dict .Values.multitenancy).enabled }}
        # Apply template definitions provided in init_data values of the values.yaml file
        {{- $defaultParameters := dict "init_data" (
              include "template-value" ( dict "value" 
                ( .Values.destination.parameters.init_data "context" . ) 
              ) | fromYaml 
            )
        }}
        # Include default SAP BTP Service Instance template and merge parameters
        {{- include "cap.service-instance" (  
              merge ( dict "defaultParameters" $defaultParameters ) . 
            ) 
        }}
    {{ end }}
    ```

    > **_helpers.tpl**

    The Helm helper function "translates" the templating syntax as required. 

    ```yaml
    {{ define "template-value" }}
      {{- if kindIs "string" .value }}
        # The tpl function replaces e.g. {{ .Values.srv.port }} with the respective value
        # It also applies the provided includes to build the correct Backend Service URI
        {{- tpl .value .context }}
      {{- else }}
        {{- tpl (.value | toYaml) .context }}     
      {{- end }}
    {{- end }}
    ```

    A sample resource definition generated by Helm could look like the following. 

    ```yaml
    apiVersion: services.cloud.sap.com/v1
    kind: ServiceInstance
    metadata:
      name: susaas-destination
    spec:
      serviceOfferingName: destination
      servicePlanName: lite
      externalName: default-susaas-destination
      parameters:
        init_data:
          instance:
            destinations:
            - Type: HTTP
              # Target URL contains the dynamic Helm Release Name and correct Port
              URL: http://susaas-srv:8080
          ...
    ```

## 2. API Service

The Sustainable SaaS API Service is defined as a separate Helm Subchart. Theoretically, this Subchart can also be deployed standalone, by copying the required values into the */susaas-api/values.yaml* file ([click here](../../../../deploy/kyma/charts/sustainable-saas/charts/susaas-api/values.yaml)). In our sample scenario, the required environment specific properties are defined in the *values.yaml* file of the Helm Umbrella Chart. 

**charts/sustainable-saas/susaas-api**

```sh
Chart.yaml # Chart.yaml of the SaaS API Service
values.schema.json # Schema definition for Values.yaml file
values.yaml # Values.yaml of the SaaS API Service

───templates───
_helpers.tpl # Default Helm template helpers
api-rule.yaml # API Rule template exposing the SaaS API Service externally
deployment.yaml # Deployment template for the SaaS API Service 
istio-auth-policy.yaml # Authorization Policy template allowing access by Istio Ingress Gateway
istio-sidecar.yaml # Default Sidecar limits required Istio configurations
network-policy.yaml # Network Policy allowing access by Istio Ingress Gateway only
pod-autoscaler.yaml # Horizontal Pod Autoscaler template based on CPU utilization
pod-disruption-budget.yaml # Pod Disruption Budget template for voluntary disruptions
secret.yaml # Secret template for potential Image Pull Secret 
service-account.yaml # Service Account template for the SaaS API Service
service-binding.yaml # SAP BTP Service Binding template required by the SaaS API Service
service-keys.yaml # SAP BTP Service Binding template used to create standalone service keys
service.yaml # Cluster IP Service template for the SaaS API Service
``` 

**Good to know**

- The Authorization Policy of the API Service is configured to allow access by Istio Ingress Gateway only. This opens the API Service to external traffic, as the associated Istio Virtual Service (created by the given API Rule), routes all requests to the Cluster IP Service of the SaaS API Service workload (except for scenarios integrating SAP API Management). 

- The Authorization Policy, as well as the respective API Rule, are only being used, if the SAP API Management integration is not enabled. For the integration of SAP API Management, the API Rule is replaced by a dedicated Virtual Service definition in the *apim-proxy* directory ([click here](../../../../deploy/kyma/charts/sustainable-saas/charts/susaas-api/templates/apim-proxy/) or find details below). 

- The API Service Subchart contains a special Helm template allowing you to create Service Keys. If any **serviceKeys** value is defined in the *values.yaml*, a corresponding SAP BTP Service Binding will be created. This will create new Client Credentials but compared to regular Service Bindings (**bindings** property), the generated Secrets will not be mounted to the workload. 

  > **Hint** - A Service Key is required for the Integration of SAP API Management, as dedicated Client Credentials of the API XSUAA Service Instance have to be stored in SAP API Management. This way, requests originating from SAP API Management can be securely authenticated. 

**API Management Proxy** 

The API Management Proxy directory (**apim-proxy** - [click here](../../../../deploy/kyma/charts/sustainable-saas/charts/susaas-api/templates/apim-proxy/)) contains various Istio templates to ensure a secure SAP API Management integration. As SAP API Management is a service running outside the Kyma Cluster, all requests targeting the SaaS API Service will initially leave the Kyma environment, and will return back to Kyma after the API Policies have been successfully checked (find more details below). 

```sh
istio-auth-policy.yaml # Authorization Policy for traffic targeting the SaaS API workload
istio-dest-rule-apim.yaml # Destination Rule for traffic targeting SAP API Management
istio-request-auth.yaml # Request Authentication for traffic targeting the SaaS API workload
istio-service-entry-apim.yaml # Service Entry to add SAP API Management as mesh external service
istio-virtual-service.yaml # Virtual Service for routing to SAP API Management or the SaaS API workload
``` 

To guarantee that no request can reach the API Service workloads without passing through SAP API Management, respective Istio resources ensure, that a valid JWT token is part of an incoming request. This JWT token is generated and injected by SAP API Management, based on Client Credentials of an XSUAA service instance. Below you can see a visualization, depicting how a request arriving through Istio Ingress Gateway is being processed.

[<img src="./images/APIManagementArch.png" width="800"/>](./images/APIManagementArch.png?raw=true)

- First of all, a so-called  **Service Entry** makes SAP API Management known as an external service to the Service Mesh. This allows us to it e.g., as destination target of Virtual Services. 

- To integrate SAP API Management, a dedicated **Istio Virtual Service** is used, routing traffic based on a custom header (x-jwt-assertion). In case the header is missing (initial request), the request is routed to SAP API Management. If the custom header is available, traffic is forwarded to the API Service workload. 

    > **Important** - The custom header is injected by SAP API Management, after the request was processed and all Traffic Policies have been successfully checked.

    ```yaml
    apiVersion: networking.istio.io/v1beta1
    kind: VirtualService
    spec:
      # Matches all requests arriving on host exposed by SusaaS API Service 
      gateways: 
        - demo-dns/sap-demo-gateway
      hosts: 
        - susaas-api-default.sap-demo.com
      http:
        - match:
            # Matches requests with x-jwt-assertion header (custom header)
            - headers:
                x-jwt-assertion: {}
          # Routes requests to ClusterIP service of SusaaS API Service 
          route:
            - destination:
                host: susaas-api.default.svc.cluster.local
                port:
                  number: 5000
        # Matches requests without x-jwt-assertion header (custom header)
        - match:
            - withoutHeaders:
                x-jwt-assertion: {}
          # Rewrite URL path to add API Proxy path and authority details
          rewrite:
            uri: /kyma-api-susaas/
            authority: sap-demo.prod.apimanagement.us20.hana.ondemand.com
          # Routes to SAP API Management defined in the Service Entry
          route:
            - destination:
                host: sap-demo.prod.apimanagement.us20.hana.ondemand.com
                port:
                  number: 443
    ```

- An Istio **Request Authentication** ensures, that all requests targeting the API Service workload are checked for a **valid** JWT token, provided by a trusted issuers. If this is the case, the incoming request is considered authenticated and respective identity details can be used in subsequent Authorization Policies. 

  > **Hint** - A Request Authentication without an Authorization Policy does not restrict access to your workloads. It only allows you to **authenticate** requests and ensures that JWT tokens are issued by a trusted issuer. The authentication details (like the identity available in the requestPrincipals property) can afterwards be validated in Authorization Policies. In case the JWT provider does not match a trusted issuer, the request will still be forwarded, but is considered "un-authenticated" not containing any identity details. 

  ```yaml
  apiVersion: security.istio.io/v1beta1
  kind: RequestAuthentication
  spec:
    # Any request targeting the Kyma API Service workload
    selector:
      matchLabels: 
        app.kubernetes.io/name: api
    # Check if request contains a valid JWT token issued by XSUAA instance of the the Provider Subaccount
    jwtRules:
      - issuer: https://sap-demo.authentication.us20.hana.ondemand.com/oauth/token
        jwksUri: https://sap-demo.authentication.us20.hana.ondemand.com/token_keys
        # As the JWT token of the initial user request shall be retained a custom header is being used
        fromHeaders:
          - name: x-jwt-assertion
  ```
 
- An Istio **Authorization Policy** finally ensures, that the API Service workloads can only be reached by requests providing a specific Issuer and Subject (sub) claim as part of the previously validated JWT token. This can be handled by checking the requestPrincipals property, which is provided in the following structure \<JWT-Issuer\>/\<JWT-Subject\>. 
  
  > **Hint** - In this sample the JWT token issuer has to match the **token endpoint** of the provider XSUAA tenant (like https://</span>sap-demo.authentication.us20.hana.ondemand.com/oauth/token) and the Subject has to contain the appname of the API XSUAA Service Instance prefixed with "sb-". The default structure of the Subject in this sample is **sb-\<Release-Name\>-api-\<Release-Namespace\>** and has to be provided in the *values.yaml* file (like sb-susaas-api-default).

  ```yaml
  apiVersion: security.istio.io/v1beta1
  kind: AuthorizationPolicy
  spec:
    action: ALLOW
    # Any request targeting the Kyma API Service workload
    selector:
      matchLabels:
        app.kubernetes.io/name: api
    # Only grant access if Issuer and Subject of the authenticated request match a defined pattern
    # The Issuer has to match the XSUAA token endpoint of the Provider Subaccount 
    # The prefix of the Subject has to match the appname of the API XSUAA Service Instance (incl. sb-prefix)
    rules:
      - from:
        - source:
            # Will only be available if Request Authentication was successful
            requestPrincipals: 
              - https://sap-demo.authentication.us20.hana.ondemand.com/oauth/token/sb-susaas-api-default!*
  ```

- The Istio **Destination Rule** allows us to use simple TLS communication for egress traffic targeting SAP API Management. As Istio enforces mutual TLS as default communication within the mesh, any exception has to be explicitly defined. 


## 3. API Service Broker

The Sustainable SaaS API Service Broker is defined as a separate Helm Subchart. Theoretically, this Subchart can also be deployed standalone, by copying the required values into the */susaas-broker/values.yaml* file ([click here](../../../../deploy/kyma/charts/sustainable-saas/charts/susaas-broker/values.yaml)). In this sample scenario, the required environment specific values are defined in the *values.yaml* file of the Umbrella Helm Chart. 

**charts/sustainable-saas/susaas-broker**

```sh
Chart.yaml # Chart.yaml of the API Service Broker
values.schema.json # Schema definition for Values.yaml file
values.yaml # Values.yaml of the API Service Broker

───templates───
_helpers.tpl # Default Helm template helpers
api-rule.yaml # API Rule template exposing the API Service Broker externally
broker-catalog.yaml # API Service Broker catalog.json file template (e.g. service plans)
broker-service.yaml # Config Map template for the API Service Broker (e.g. xssecurity extensions)
deployment.yaml # Deployment template for the API Service Broker 
istio-auth-policy.yaml # Authorization Policy template allowing access by Istio Ingress Gateway
istio-sidecar.yaml # Default Sidecar limits required Istio configurations
network-policy.yaml # Network Policy allowing access by Istio Ingress Gateway only
pod-autoscaler.yaml # Horizontal Pod Autoscaler template based on CPU utilization
pod-disruption-budget.yaml # Pod disruption budget template for voluntary disruptions
secret.yaml # Secret template for potential Image Pull Secret 
service-account.yaml # Service Account template for the API Service Broker
service-binding.yaml # SAP BTP Service Binding template for the API Service Broker
service.yaml # ClusterIP Service template for the API Service Broker
```

**Good to know**

- The Authorization Policy of the SusaaS API Service Broker is configured to allow access by Istio Ingress Gateway only. This exposes the service to external traffic, as the associated Istio Virtual Service (created by the provided API Rule), routes all requests to the Cluster IP Service of the API Service Broker workload. 

- The API Service Broker requires a Config Map Helm template, containing some extension definitions used by the Service Broker when generating new Client Credentials. 

    > **Hint** - These configurations extend the default API Service Broker settings and ensure that the **service plan** (selected by the subscriber) is added as a scope to tokens issued for the respective service instance. Another extension adds the API URI to all issued client credentials of respective service instances (so we do not have to provide them the URI manually). 
    
    ```yaml
    apiVersion: v1
    kind: ConfigMap
    data:
      serviceConfigs: | -
        { 
          "susaas-api-default-a1b2c3d4": {
            "extend_credentials": {
              "shared": {
                # Adds the SaaS API URI to client credentials as an additional information
                "apiUrl": "https://susaas-api-default.sap-demo.com"
              }
            },
            "extend_xssecurity": {
              "per_plan": {
                 "default": {
                   "authorities": [
                      # Adds plan_default scope to tokens issued by "default-plan" service instances
                      "$XSMASTERAPPNAME.plan_default"
            ...
    ```

- An additional ConfigMap template (broker-catalog.yaml), results in a *catalog.json* file mounted to the file system of our API Service Broker containers. This dynamic ConfigMap contains information about all service plans offered by our API Service Broker. 


## 4. Application Router

The Sustainable SaaS Application Router is defined in a separate Helm Subchart. This Subchart can also be deployed standalone, by copying the required values into the */susaas-router/values.yaml* file ([click here](../../../../deploy/kyma/charts/sustainable-saas/charts/susaas-router/values.yaml)). In this sample scenario, the required environment specific values are defined in the *values.yaml* file of the Umbrella Helm Chart.

**charts/sustainable-saas/susaas-router**

```sh
Chart.yaml # Chart.yaml of the Application Router
values.schema.json # Schema definition for Values.yaml file
values.yaml # Values.yaml of the Application Router

───templates───
_helpers.tpl # Default Helm template helpers
api-rule.yaml # API Rule template exposing the Application Router externally
deployment.yaml # Deployment template for the Application Router
istio-auth-policy.yaml # Authorization Policy template allowing access by Istio Ingress Gateway and Ory Oathkeeper
istio-dest-rule.yaml # Destination Rule template enforcing mTLS
istio-sidecar.yaml # Default Sidecar limits required Istio configurations
network-policy.yaml # Network Policy template allowing access by Istio Ingress Gateway and Ory Oathkeeper
pod-autoscaler.yaml # Horizontal Pod Autoscaler template based on CPU utilization
pod-disruption-budget.yaml # Pod disruption budget template for voluntary disruptions
secret.yaml # Secret template for potential Image Pull Secret 
service-account.yaml # Service Account template for the Application Router
service-binding.yaml # SAP BTP Service Binding template for the Application Router
service.yaml # Cluster IP Service template for the Application Router
```

**Good to know**

- The **Authorization Policy** of the Application Router is configured to allow access by Istio Ingress Gateway and Ory Oathkeeper Proxy only. This exposes the Application Router to public traffic, as the associated Istio Virtual Services (created by corresponding the Kyma API Rule), route all requests to the Cluster IP Service of the Application Router workload. Either directly or through Ory Oathkeeper in case of Subscriber Tenant access. Latter injects the required **x-custom-host** header.

- Like the Backend Service, also the Application Router uses a dedicated **Service Account** instead of the **default** one. This allows the usage of the corresponding Service Account **Principal** in the Authorization Policy of our Backend Services. Doing so, we can ensure that only the Application Router can communicate with our Backend Service. 


## 5. SaaS Backend Service

The Sustainable SaaS Backend Service is defined as a separate Helm Subchart. Like all the other Subcharts, also the Backend Service can be deployed standalone, by copying the required values in the */susaas-srv/values.yaml* file ([click here](../../../../deploy/kyma/charts/sustainable-saas/charts/susaas-srv/values.yaml)). In this sample scenario, the required environment specific values are defined in the *values.yaml* file of the Umbrella Helm Chart. 

**charts/sustainable-saas/susaas-srv**

```sh
Chart.yaml # Chart.yaml for the SaaS Backend Service
values.schema.json # Schema definition for Values.yaml file
values.yaml # Values.yaml for the SaaS Backend Service

───templates───
_helpers.tpl # Default Helm template helpers
api-rule.yaml # API Rule template exposing the SaaS Backend Service
cluster-role.yaml # Cluster Role template for permissions required during runtime
deployment.yaml # Deployment template for the SaaS Backend Service
istio-auth-policy.yaml # Authorization Policy template allowing access by Istio Ingress Gateway and Application Router only
istio-sidecar.yaml # Default Sidecar limits required Istio configurations
network-policy.yaml # Network Policy allowing access by Application Router and Istio Ingress Gateway
pod-autoscaler.yaml # Horizontal Pod Autoscaler template based on CPU utilization
pod-disruption-budget.yaml # Pod disruption budget template for voluntary disruptions
role-binding.yaml # Role Binding template to assign Cluster Role to Service Account
secret.yaml # Secret template for potential Image Pull Secret 
service-account.yaml # Service Account template for the SaaS Backend Service
service-binding.yaml # SAP BTP Service Binding template for the SaaS Backend Service
service.yaml # ClusterIP Service template for the SaaS Backend Service
```

**Good to know**

- The Sustainable SaaS Backend Service is using a separate **Service Account**, and the respective Service Account Token is **auto-mounted** (only workload requiring this). In combination with a separate **Cluster Role** (including permissions to manage API Rules) and a respective **Role Binding**, this enables the Backend Service to create **API Rules** for new subscribers at runtime. To learn more, check the *srv/utils/apiRule.js* implementation.
  
- The **Authorization Policy** of our Backend Service allows access from the Application Router workloads only by restricting access to the corresponding principal. The only exception are the "*/-/cds/.\**" paths, which are accessible through Istio Ingress Gateway. This blocks public traffic access except for those dedicated paths. The associated Virtual Service (created by the provided API Rule) only redirects traffic on these specific paths to the Cluster IP Service of the Backend Service workloads. All other requests targeting the Backend Service, have to pass through the Application Router first. 

- The Application Router ensures that requests are properly authenticated by XSUAA (and enforces a login if required) and will handle multitenancy. The communication between Application Router and our Backend Service is unrestricted, as the Application Router principal has been added to the respective Authorization Policy. 

  ```yaml
  apiVersion: security.istio.io/v1beta1
  kind: AuthorizationPolicy
  spec:
    # Matches any request targeting the SaaS Backend Service workload
    selector: 
      matchLabels: 
        app.kubernetes.io/name: srv
    action: ALLOW
    rules:
      # Allow Istio Ingress Gateway traffic to access all /-/cds/* paths
      # Required for dependency callbacks and CDS related requests (e.g., extensions)
      - to:
        - operation:
            paths: 
              - /-/cds/*
        from: 
          - source:
              principals:
                - cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account
      # Grants access to all paths for traffic from Application Router 
      # "ns" in the match pattern is the abbreviation for "Namespace"
      # "sa" in the match pattern is the abbreviation for "Service Account"
      - from:
        - source:
            principals: 
              - cluster.local/ns/default/sa/susaas-router
  ```