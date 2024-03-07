# Understand SAP BTP Multitenancy

- **Kyma** ✅ 
- **Cloud Foundry** ✅

In SAP BTP, you can develop and run multitenant applications that can be accessed by multiple consumers (tenants) through a dedicated URL. In this sample scenario, we decided to implement the solution based on a standardized toolset including the SAP Cloud Application Programming (CAP) Model.

## Context

When developing tenant-aware applications in the SAP BTP, keep in mind the following general programming guidelines.

- Shared in-memory data is available to all tenants
- Avoid any possibility that application users can execute custom code in the application, as this may give them access to data of other tenants
- Avoid any possibility that application users can access a file system, as this may give them access to data of other tenants
- To perform internal Tenant onboarding activities, such as creating a database schema for tenants, you must implement the Subscription callbacks of the *SAP Software as a Service Provisioning service* (saas-registry) and use the information provided in the subscription event. You can also implement the getDependencies callback to obtain the dependencies of any SAP reuse services by your application. 

Check out the following content in SAP Help for further information ([click here](https://help.sap.com/docs/btp/sap-business-technology-platform/develop-multitenant-application?locale=en-US)).


## SAP BTP Multitenancy Model

In this tutorial, we are using some keywords like Provider (sub)account, consumer/Tenant Subaccount, provisioning, onboarding, and data isolation. 

**Provider (Sub)account** 
The Provider is the vendor of the SaaS application. This is the company that is going to build, deliver, and operate the multitenant SaaS solution for all consumers. The vendor has a **Provider account**, a Global Account in SAP BTP.

**Consumer/Tenant Subaccount** 
A Consumer or Tenant is the user of the SaaS application. This can be another team or company that is going to use the multitenant SaaS solution. This Consumer subscribes to the SaaS solution from their **Consumer Subaccount** which is a subaccount of the vendor's Global Account in SAP BTP.

> **Hint** - It's important to differentiate between *Consumer* and *Tenant*. While a Consumer can consume multiple SaaS applications, a Tenant is a specific instance of a SaaS application of a dedicated Consumer. Still, a *Tenant Subaccount* and a *Consumer Subaccount* refer to the same entity, meaning a dedicated subaccount in which one or multiple Tenant instances of a Consumer are subscribed. 
> 
>Subaccount (1..1) Consumer - For each subaccount, there can only be one Consumer assignment<br>
>Subaccount (1..1) Tenant - For each subaccount, there can only be one Tenant per SaaS application<br>
>Consumer (1..1) Tenant - For each consumer, there can only be one Tenant per SaaS application<br>

**Onboarding**
This is the end-to-end process of creating a subaccount for a new SaaS Consumer in the vendor's Global Account in SAP BTP and giving him access to the actual Consumer Tenant SaaS application instance. 

**Provisioning** 
This is the process of onboarding new consumers to the multitenant SaaS solution. During the provisioning process, a Tenant database schema is created and dependencies are injected into the Consumer Subaccount.


## Provider's Point of View

Putting together the general account model of an SAP BTP SaaS solution results in the following structure:

[<img src="./images/account-model.png" width="500" />](./images/account-model.png?raw=true)


## SAP CAP (MTXS)

The sample application has been developed using the SAP Cloud Application Programming (CAP) Model. This framework offers a dedicated npm package for handling multitenancy which is called **cap-mtxs** ([click here](https://www.npmjs.com/package/@sap/cds-mtxs)). The **@sap/cds-mtxs** package provides a set of services that implement **m**ultitenancy, features **t**oggles, and e**x**tensibility (‘MTX’ stands for these three features). 

Please refer to the official CAP MTXS documentation for further details ([click here](https://cap.cloud.sap/docs/guides/multitenancy/mtxs)).


## Further information

Please use the following links to find further information on the topics above:

* [Youtube - SAP BTP - Multitenant Business Applications](https://www.youtube.com/playlist?list=PLkzo92owKnVx3Sh0nemX8GoSNzJGfsWJM)
* [SAP Cloud SDK - Introduction to multi-tenant concepts](https://sap.github.io/cloud-sdk/docs/js/tutorials/multi-tenant-application)
* [GitHub - generator-saphanaacademy-saas](https://github.com/saphanaacademy/generator-saphanaacademy-saas)
* [SAP Help - Multitenant Applications in the Cloud Foundry Environment](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/5e8a2b74e4f2442b8257c850ed912f48.html)
* [SAP Blogs - Fundamentals of Multitenancy in SAP BTP](https://community.sap.com/t5/technology-blogs-by-sap/fundamentals-of-multitenancy-in-sap-btp/ba-p/13527283)
* [SAP Blogs - Getting your head into Cloud Application Programming model multitenancy](https://blogs.sap.com/2020/08/20/getting-your-head-into-cloud-application-programming-model-multitenancy/)
