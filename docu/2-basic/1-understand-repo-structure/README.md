# Understand the Repository Structure

This part of the tutorial will briefly outline the structure of **code** directory, so you're comfortable navigating through the provided GitHub repository. 

> **Hint** - This chapter will not cover the files in the **deploy** folder, which will be explained in further detail within the respective environment-specific subfolders. 

- [Understand the Repository Structure](#understand-the-repository-structure)
  - [1. Overview](#1-overview)
  - [2. API Service](#2-api-service)
  - [3. Application](#3-application)
  - [4. API Broker](#4-api-broker)
  - [5. Tenant data model](#5-tenant-data-model)
  - [6. Shared data model](#6-shared-data-model)
  - [7. Application Router](#7-application-router)
  - [8. Annotation Files](#8-annotation-files)
  - [9. Business Application Service](#9-business-application-service)
  - [10. Test objects](#10-test-objects)

Also, check out our **Explore the components** chapter ([click here](../9-explore-the-components/README.md)), which describes the various SaaS application components and their tasks in greater detail ([click here](../7-explore-the-components/README.md)). For now, let us start with a brief overview, before deep-diving into the different sub-directories. 


## 1. Overview

The **code** directory of our GitHub repository consists of several sub-directories containing the API (Service) Broker, the API Service, and the different application layers like User Interface, the Backend Business Application service layer, and the data models deployed in a tenant-specific and shared database container. Furthermore, you can find the Helm Charts (required for the Kyma deployment), content supporting local testing or even examples how to extend the SaaS application. 

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_All.png" width="350"/>](./images/Repo_Structure_All.png?raw=true) | <br> <br> **api -** CAP-based API service <br> **app -** SAP Fiori Elements UI modules <br> **broker -** API Service Broker <br> **db -** Tenant data model <br> **db-com -** Shared/Common data model <br> **http -** HTTP files for testing purposes <br> **obd -** Onboarding Service (Expert Feature) <br> **router -** Application Router <br> **srv -** CAP-based Business Application service <br> **test -** Unit tests and sample data <br> <br> **.cdsrc.json -** CAP project configuration <br> **.env.sample -** Environment variables for local testing  <br> **package.json -** CDS configs and dependencies for local testing |

> **Hint** - Each of our CAP-based application components like the SaaS Backend Service or the API Service contain a dedicated *package.json* file. Instead of using the root-level *package.json* file we decided to provide component specific dependencies and CDS production profile configurations.

## 2. API Service

The **api** directory contains the implementation of the **CAP-based** API Service which can be used by SaaS consumers to upload or maintain data in their Tenant database containers. Further details can be found in a separate part of this tutorial ([click here](../6-push-data-to-saas-api/README.md)).

> **Hint** - Using Kyma, the API Service container image is build using *Cloud Native Buildpacks*, therefore the directory does not contain a separate Dockerfile. Further details on the build process are provided in a separate part of the tutorial ([click here](../3-build-your-docker-images/README.md))!

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_API.png" width="350"/>](./images/Repo_Structure_API.png?raw=true) |  **api-service.cds -** CAP-based API Service definition <br> **api-service.js -** CAP-based API Service handler  <br> **package.json -** Node.js dependencies and start script <br> **server.js -** Custom server.js for health-check endpoints |


## 3. Application

Besides the **html5-deployer** directory (containing the **HTML5 Application Deployer** - find details [here](https://cap.cloud.sap/docs/guides/deployment/deploy-to-kyma#ui-deployment)), the **app** directory contains all SAP Fiori Elements modules, which result in dynamically generated UIs, based on the OData Backend Service annotations. During the UI build process, all four UI modules are zipped and copied into a *resources* folder within the *html5-deployer* directory. This folder is created during the very first build.

> **Hint** - Using Kyma, the **HTML5 Apps Deployer** container image is build using an existing *Docker Image* maintained by SAP, which is referenced in the respective Dockerfile. Further details on the build process are provided in a separate part of the tutorial ([click here](../3-build-your-docker-images/README.md))!

> **Hint** - In Cloud Foundry, the **HTML5 Apps Deployer** is not required during productive deployment but can still be used for deployments from your local development environment.

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_App.png" width="350"/>](./images/Repo_Structure_App.png?raw=true) |  **html5-deployer -** HTML5 Application Deployer configuration <p style='padding-left:1em'> **.dockerignore -** Ignores package.json for docker build <br> **Dockerfile -** Docker image based on sapse/html5-app-deployer <br> **package.json -** Required for local testing only </p> **ui-admin-projects -** Admin UI for project management <p style='padding-left:1em'> **webapp -** UI5 applicaton resources <br><p style='padding-left:2em'>**ext -** Fiori Elements extensions <br> **i18n -** Translation files <br> **utils -** Reusable coding <br> **Component.js -** Component coding <br> **index.html -** For standalone usage  <br> **manifest.json -** SAPUI5 manifest file  </p><p style='padding-left:1em'> **package.json -** Required for build process <br> **ui5-deploy.yaml -** Required for build process <br> **xs-app.json -** HTML5 App Repository routes <br>(copied to webapp folder during UI build) </p> **ui-admin-users -** Admin UI for user management <br> **ui-public-assessments -** UI for assessment management <br> **ui-public-flp -** UI for sandbox launchpad  <br> **ui-public-projects -** UI for viewing project details <br> <br> **index.html** - Sandbox launchpad for cds watch |

The **ui-public-flp** UI module contains a Sandbox Launchpad. The [Application Router](#7-application-router) **welcomeFile** property is routing to this module stored in the HTML5 Application Repository. Keep in mind, that when using UI5 applications in a Launchpad context, always the UI5 release defined for the actual Launchpad is being used for your SAPUI5 applications. 


## 4. API Broker

The **broker** directory contains the API Service Broker implementation. The catalog.json file (which is required to define service plans provided by the Service Broker) is part of the Helm Charts ([click here](../../../code/charts/sustainable-saas/charts/susaas-broker/templates/broker-catalog.yaml)), as the required details are only available upon deployment to your Kyma Cluster.

> **Hint** - Using Kyma, the API Service Broker container image is build using *Cloud Native Buildpacks*, therefore the directory does not contain a separate Dockerfile. Further details on the build process are provided in another part of the tutorial!

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Broker.png" width="350"/>](./images/Repo_Structure_Broker.png?raw=true) | **package.json -** Node.js dependencies and start script <br> **start.js -** Custom start script for API Service Broker <br> (reading credentials from env variables) |


## 5. Tenant data model

The **db** directory contains the definition of our Tenant data model, which is deployed to a separate isolated SAP HANA Cloud HDI (HANA Deployment Infrastructure) database containers for each and every SaaS Tenant upon subscription. Besides a **CDS-based** data model, the directory also contains SAP HANA native objects (e.g., hdbgrants or synonyms) for accessing the shared HDI database container. Make sure to run a **cds build --production** in case of changes to the Tenant data model before building new Docker Images of your SaaS Backend Service.

> **Hint** - As the Tenant data model is part of our SaaS Backend Service and deployed to new Tenant database containers at runtime, there is no need to build a separate Docker Image for this component. The data model definition is stored within the Backend Service and the mtxs Deployment Service ([click here](https://cap.cloud.sap/docs/guides/multitenancy/mtxs#deploymentservice)) allows an automated deployment to new database containers. 

> **Important** - Based on the CDS profiles used in *cds watch* or *cds build*, the Tenant data model includes or excludes **sample data**. For **local testing** using sqlite, master data tables (e.g., Currencies or Countries) and sample values are part of the Tenant data model. For a **production** builds targeting SAP HANA Cloud, these tables and sample values are replaced by views pointing to a shared database container. Also check the *package.json* profile **db-ext** for a better understanding of this approach.

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Tenant_Db.png" width="350"/>](./images/Repo_Structure_Tenant_Db.png?raw=true) | <br><br> **cfg -** Configuration for shared container access <br> **hana -** Data model extension for production build <br> **sqlite -** Data model extension for local testing <br> **src -** Native SAP HANA database objects <br><p style='padding-left:1em'> **functions -** Sample function <br> **procedures -** Sample stored procedure <br> **roles -** Sample schema roles <br> **synonyms -** Synonyms for SYS and shared container </p> **data-models.cds -** CAP Tenant data model <br> **data-types.cds -** CAP data model types <br> **undeploy.json -** Undeploy configuration |
 

## 6. Shared data model

The **db-com** directory contains the definition of a shared data model, which is accessible from all isolated Tenant database containers. It is used for data required and shared by all Consumer Tenants. The shared data model has to be deployed separately into a dedicated SAP HANA Cloud HDI database container during deployment of the SaaS sample application. 

> **Hint** -  Using Kyma, the container image deploying the shared data model to a dedicated database container, is build using *Cloud Native Buildpacks*, therefore the directory does not contain a separate Dockerfile. Further details on the build process are provided in a separate part of the tutorial ([click here](../3-build-your-docker-images/README.md))!

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Shared_Db.png" width="300" />](./images/Repo_Structure_Shared_Db.png?raw=true) | **src -** Native SAP HANA database objects <br> <p style='padding-left:1em'>  **\*_ACCESS.hdbrole -** Roles for access from Tenant containers </p>  **data-model.cds -** Shared CAP data model <br> **undeploy.json -** Undeploy configuration |


## 7. Application Router

The **router** directory contains all files of the Application Router required by our SaaS sample application. In this case, only the *xs-app.json* file and a health-check is required. 

> **Hint** - The Application Router Docker Image build process makes use of the official *sapse/approuter* Docker Image. Further details on the build process are provided in a separate part of the tutorial ([click here](../3-build-your-docker-images/README.md))!

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Router.png" width="350"/>](./images/Repo_Structure_Router.png?raw=true) |  **.dockerignore -** Ignore package.json for docker build <br> **Dockerfile -** Docker image based on sapse/approuter for Kyma deployment <br> **health.html -** Used for pod health checks <br> **package.json -** Required for local testing and Cloud Foundry deployment  <br> **xs-app.json -** Route definitions for productive usage <br>  |


## 8. Annotation Files

The **annotations** folder in the **srv** directory contains all service annotations required to generate the Fiori Elements UIs of our sample application. These annotations define the capabilities of the OData Services but also set the layouts of the SAP Fiori Elements user interfaces. 

> **Hint** - As for any other changes to the SaaS Backend Service, make sure to run a **cds build --production** in case of any changes to the annotation files before building a new Docker Image!

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Annotations.png" width="350"/>](./images/Repo_Structure_Annotations.png?raw=true) |  **admin -** Admin Service annotations <br> **public -** User Service annotations <br><p style='padding-left:1em'> **capabilities.cds -** Service capability annotations <br>**fieldControls.cds -** Service field control annotations <br>**layouts_\*.cds -** Fiori Elements layout annotations </p> **labels.cds -** Label annotations <br> **valueHelp.cds -** Value help annotations  <br> |

> **Hint** - Yes, these annotation files can also be part of your UI modules as you can see in other tutorials. Feel free to move them around if you feel more comfortable storing the annotations among your actual UI components. 


## 9. Business Application Service

The rest of the **srv** directory contains the implementation of our Business Application or central SaaS Backend Service. This includes OData-Services (*admin-service.js/cds* and *user-service.js/cds*) for our Fiori Elements UIs, as well as the automation logic executed on the subscription of new consumer-tenants (*provisioning.js*). The corresponding subscription service endpoints are exposed by using the **CAP mtxs** ([click here](https://cap.cloud.sap/docs/guides/multitenancy/mtxs) for further details). 

```json
{
  "requires": {
    "multitenancy": true
  }
}
```

**Onboarding Automation**

A lot of the Tenant onboarding steps have been automated using platform APIs and SAP BTP services. Start from the *provisioning.js* file and deep-dive into the various utilities like e.g., *apiRule.js*, creating API Rules for new subscribers by interacting with the Kyma API Server. 

> **Hint** - The SaaS Backend Service Docker Image is build using *Cloud Native Buildpacks*, therefore the directory does not contain a separate Dockerfile. Further details on the build process are provided in a separate part of the tutorial ([click here](../3-build-your-docker-images/README.md))!

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Service.png" width="350"/>](./images/Repo_Structure_Service.png?raw=true) | **i18n -** Language files <br> **utils -** Utilities (mainly for automation purposes) <br><p style='padding-left:1em'> **alertNotification.js -** Alert Notification utilities <br> **apiRule.js -** Kyma API Rule utilities <br> **automator.js -** Tenant onboarding automation <br>**cis-central.js -** Cloud Management Service utilities <br>**destination.js -** Destination Service utilities <br>**service-manager.js -** Service Manager utilities <br>**token-utils.js -** Token handler utilities <br>**user-management.js -** User management utilities </p> **admin-service.cds -** CAP Admin Service definition <br>**admin-service.js -** CAP Admin Service handler <br> **annotations.cds -** Annotation CDS file references <br>**provisioning.js -** Tenant provisioning handler <br> **public-service.cds -** CAP User Service definition <br> **public-service.js -** CAP User Service handler <br> **server.js -** Health endpoints and custom provisioning  |


## 10. Test objects

The **test** directory contains sample data for local development and testing purposes as well as sample unit tests. 

> **Hint** - These files should not be part of a productive deployment and are not part of the **production** build profile. 

| | |
|:--: | :--- |
| [<img src="./images/Repo_Structure_Test.png" width="350"/>](./images/Repo_Structure_API.png?raw=true) | **data -** Sample data for Tenant data model <br><br> **http -** Sample HTTP requests for API testing  <br><br> **index.cds -** CDS file for builder <br> **test.js -** Sample unit tests <br> |