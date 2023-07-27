# Integration of Consumer IdPs

- ### **Kyma** ✅
- ### **Cloud Foundry** ✅

In this part of the **Expert Features** you will learn how to integrate Consumer IdPs (Identity Providers) like Azure Active Directory. As we did not explicitly set up a dedicated Consumer IdP in our SaaS sample scenario, in this chapter we will just briefly highlight some possible approaches. 

- [Integration of Consumer IdPs](#integration-of-consumer-idps)
  - [1. Introduction](#1-introduction)
  - [2. Provider-driven integration](#2-provider-driven-integration)
    - [2a. Central SAP IAS tenant](#2a-central-sap-ias-tenant)
    - [2b. Consumer SAP IAS tenant](#2b-consumer-sap-ias-tenant)
  - [3. Consumer-driven integration](#3-consumer-driven-integration)
    - [3a. Integration with SAP IAS](#3a-integration-with-sap-ias)
    - [3b. Integration with SAP XSUAA](#3b-integration-with-sap-xsuaa)
  - [4. Further Information](#4-further-information)

> **Hint** - We highly appreciate your feedback/input/problems/issues in case you try to set up such a scenario yourself. 


## 1. Introduction

In a SaaS scenario with just a handful of users, the In-App User Management is a very convenient access management solution. Nevertheless, things will change when your SaaS application is used by an increasing number of users or when acting in a B2B context. 

Most of your SaaS consumers (especially in B2B scenarios) will have their own user base managed by respective Identity Providers (like Azure Active Directory). Using the In-App User Management would cause a lot of double maintenance. Therefore, your SaaS consumers will probably ask for options to integrate their own Identity Providers with your SaaS solution. 

In the following, we will discuss different approaches to how such an integration can be achieved. These scenarios are also depicted in the following architecture diagram. 

**Kyma**

[<img src="./images/CIAS_ArchitectureKyma.png" width="500" />](./images/CIAS_ArchitectureKyma.png?raw=true)

**Cloud Foundry**

[<img src="./images/CIAS_ArchitectureCf.png" width="500" />](./images/CIAS_ArchitectureCf.png?raw=true)


> **Important** - All approaches will require coding changes in the application logic, as the current implementation relies on the In-App User Management to create users in SAP IAS and/or Shadow Users in SAP XSUAA. 


## 2. Provider-driven integration

Provider-driven integrations (as we call it in this sample - no official term) are based on consumers wishing to use their Identity Provider with an SAP IAS tenant owned by the SaaS Provider. This is useful for scenarios in which a Consumer doesn't have an SAP BTP Global Account or hesitates additional maintenance effort. 

**Important** - The **Provider-driven integration** approaches will make the existing In-App User Management obsolete. Make sure to understand the implications of integrating Consumer IdPs and adapt the application logic accordingly!


### 2a. Central SAP IAS tenant

A convenient integration pattern makes use of so-called **Corporate Identity Providers** in the central SAP IAS tenant managed by the Provider. Corporate Identity Providers let you integrate Consumer Identity Providers (like Azure Active Directory), with SAP IAS. By doing so, you can federate all or selected authentication requests to the Consumer Identity Providers. 

As the SaaS users will no longer be maintained in the In-App User Management, the role assignments need to be handled via Group Mappings. This means, once consumers authenticated using their own IdPs, they will pass through SAP IAS (acting as a proxy) and are automatically created as shadow users in SAP XSUAA. If configured correctly, you will find required **Group** assignments in the SAML metadata. These Group assignments are done by your SaaS consumers in their own IdPs. The groups need to be mapped to SAP XSUAA role collections. For Azure Active Directory Groups (using GUIDs), this looks like the following. 

[<img src="./images/CIAS_RolColMap.png" width="400" />](./images/CIAS_RolColMap.png?raw=true)

Instead of an In-App User Management, you can e.g., provide your consumers an option to maintain Group Mappings between SAP XSUAA Role Collections and their Active Directory Groups from within the SaaS application. Furthermore, you have to think about a logic to assign **Member** users to projects properly. As users are not maintained within the SaaS application anymore, you can e.g., pass the project assignment as an additional attribute in the SAML assertion. Alternatively, you can still maintain the assignments in a separate table and offer administrators an option to select from all available SAP XSUAA Shadow Users. 

> **Hint** - When a user authenticates using a Consumer IdP and the central SAP IAS tenant (acting as a proxy), a Shadow User will be automatically created in SAP XSUAA. 

Keeping potential code changes in mind, this is the first option to outsource the user management and role assignment to the consumers and their existing Identity Providers. 

A great step-by-step guide on how to set up a **Corporate Identity Provider** in SAP IAS can be found in the Tutorial Navigator ([click here](https://developers.sap.com/tutorials/cp-ias-azure-ad.html)) or in the SAP HANA Academy ([click here](https://www.youtube.com/watch?v=4qo8acsxRgU)). Further details on the integration of SAP BTP with Microsoft Azure Active Directory can be found in the official Microsoft documentation ([click here](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/scenario-azure-first-sap-identity-integration)).

Below you can find screenshots showing a respective setup process and a sample Group Mapping. Please be aware, that the below setup is very simplified and e.g., claims have to be configured differently in a production scenario.

|  |  |  |
|:----------: | :---------: | :---------: |
| [<img src="./images/IAS_AD01.png" width="250"/>](./images/IAS_AD01.png?raw=true) | [<img src="./images/IAS_AD02.png" width="250"/>](./images/IAS_AD02.png?raw=true) | [<img src="./images/IAS_AD03.png" width="250"/>](./images/IAS_AD03.png?raw=true) |
| [<img src="./images/IAS_AD04.png" width="250"/>](./images/IAS_AD04.png?raw=true) | [<img src="./images/IAS_AD05.png" width="250"/>](./images/IAS_AD05.png?raw=true) | [<img src="./images/IAS_AD06.png" width="250"/>](./images/IAS_AD06.png?raw=true) |
| [<img src="./images/IAS_AD07.png" width="250"/>](./images/IAS_AD07.png?raw=true) | [<img src="./images/IAS_AD08.png" width="250"/>](./images/IAS_AD08.png?raw=true) | [<img src="./images/IAS_AD09.png" width="250"/>](./images/IAS_AD09.png?raw=true) |
| [<img src="./images/IAS_AD10.png" width="250"/>](./images/IAS_AD10.png?raw=true) | [<img src="./images/IAS_AD11.png" width="250"/>](./images/IAS_AD11.png?raw=true) | [<img src="./images/IAS_AD12.png" width="250"/>](./images/IAS_AD12.png?raw=true) |
| [<img src="./images/IAS_AD13.png" width="250"/>](./images/IAS_AD13.png?raw=true) | [<img src="./images/IAS_AD14.png" width="250"/>](./images/IAS_AD14.png?raw=true) | [<img src="./images/IAS_AD15.png" width="250"/>](./images/IAS_AD15.png?raw=true) |
| [<img src="./images/IAS_AD16.png" width="250"/>](./images/IAS_AD16.png?raw=true) | [<img src="./images/IAS_AD17.png" width="250"/>](./images/IAS_AD17.png?raw=true) | [<img src="./images/IAS_AD18.png" width="250"/>](./images/IAS_AD18.png?raw=true) |
| [<img src="./images/IAS_AD19.png" width="250"/>](./images/IAS_AD19.png?raw=true) | [<img src="./images/IAS_AD20.png" width="250"/>](./images/IAS_AD20.png?raw=true) | [<img src="./images/IAS_AD21.png" width="250"/>](./images/IAS_AD21.png?raw=true) |
| [<img src="./images/IAS_AD22.png" width="250"/>](./images/IAS_AD22.png?raw=true) | [<img src="./images/IAS_AD23.png" width="250"/>](./images/IAS_AD23.png?raw=true) | [<img src="./images/IAS_AD23.png" width="250"/>](./images/IAS_AD23.png?raw=true) |
| [<img src="./images/IAS_AD25.png" width="250"/>](./images/IAS_AD25.png?raw=true) | [<img src="./images/IAS_AD26.png" width="250"/>](./images/IAS_AD26.png?raw=true) | [<img src="./images/IAS_AD27.png" width="250"/>](./images/IAS_AD27.png?raw=true) |
| [<img src="./images/IAS_AD28.png" width="250"/>](./images/IAS_AD28.png?raw=true) | [<img src="./images/IAS_AD29.png" width="250"/>](./images/IAS_AD29.png?raw=true) |  |


### 2b. Consumer SAP IAS tenant

Similar to using a central SAP IAS tenant to manage the users and Corporate Identity Providers of all consumers, you can also create separate SAP IAS Tenants for each Consumer. This is an alternative option for consumers with concerns to store their users in a central SAP IAS tenant managed by the SaaS Provider. 

Compared to a central SAP IAS instance, you can give your SaaS Consumer access to the consumer-specific SAP IAS tenant. This allows your SaaS Consumer to manage Corporate Identity Providers, groups, and users themselves. When setting up the respective Consumer SAP BTP Subaccounts, make sure to select the consumer-specific SAP IAS tenant when setting up the SAP XSUAA - SAP IAS trust.  

> **Important** - You are charged a fee for additional SAP IAS tenants, which you will need to cross-charge your SaaS consumer!

Once you requested an additional consumer-specific SAP IAS tenant, the required implementation steps are similar to - [Central SAP IAS tenant](README.md#2a-central-sap-ias-tenant) - and also respective coding changes are required in this scenario as the provided In-App User Management cannot be used anymore.


## 3. Consumer-driven integration

Consumer-driven integrations (as we call it in this sample - no official term) are based on consumers wishing to use their own SAP IAS tenants or consumers preferring to directly integrate their own Identity Providers with SAP XSUAA. 

**Important** - As with the **Provider driven integration** approaches, also **Consumer driven integration** approaches will make the existing In-App User Management obsolete. Make sure to understand the implications of integrating Consumer IdPs and adapt the application logic accordingly!


### 3a. Integration with SAP IAS

The integration of a consumer's own SAP IAS tenant (! requested by the Consumer !) is similar to - [Central SAP IAS tenant](README.md#2a-central-sap-ias-tenant). The major difference is, that your SaaS consumers are not using the central SAP IAS tenant managed by you as a SaaS Provider anymore, but use their own SAP IAS tenants (assigned to their own SAP CRM customer numbers). 

When a SAP IAS tenant is mapped to a different SAP CRM customer number, it will not appear in the **Establish Trust** dropdown list of your subaccounts. Therefore, you need to establish the trust manually and integrate the consumer-owned SAP IAS instances using the respective SAML metadata exchange. The other steps remain the same - like creating a **Corporate Identity Provider**, setting up Group Mappings in SAP XSUAA, and re-thinking the assignment of users to projects. 


### 3b. Integration with SAP XSUAA

> **Important** - The direct integration between SAP XSUAA and Consumer IdPs should not be your preferred solution. If possible, make use of a (central/consumer) SAP Identity Authentication Service tenant acting as a proxy. 

A variation of - [Integration with SAP IAS](README.md#3a-integration-with-sap-ias) - is to completely skip SAP IAS and directly federate SAP XSUAA authentication requests to the Consumer Identity Providers. Therefore, you need to set up a SAML trust between the Consumer Subaccounts and the Consumer Identity Providers (e.g., Azure Active Directory). While no SAP IAS tenant and Corporate Identity Provider configuration is required anymore, you still need to establish a Group Mapping and again, re-think the assignment of **Member** users to projects. 

Check the following blog post ([click here](https://blogs.sap.com/2019/03/07/how-to-integrate-azure-ad-with-sap-cloud-platform-cloud-foundry/)) or SAP HANA Academy tutorial ([click here](https://www.youtube.com/watch?v=KvAzoGHKPA0)) to find detailed instructions on how to directly integrate an Identity Provider (in this case Azure Active Directory) with SAP XSUAA. 


Below you can find screenshots showing a respective trust setup and sample Group Mapping between SAP XSUAA and a Consumer IdP (in this case Azure Active Directory). For further screenshots also check [Central SAP IAS tenant](README.md#2a-central-sap-ias-tenant) as most process steps are similar. 

|  |  |  |
|:----------: | :---------: | :---------: |
| [<img src="./images/XSUAA_AD01.png" width="250"/>](./images/XSUAA_AD01.png?raw=true) | [<img src="./images/XSUAA_AD02.png" width="250"/>](./images/XSUAA_AD02.png?raw=true) | [<img src="./images/XSUAA_AD03.png" width="250"/>](./images/XSUAA_AD03.png?raw=true) |
| [<img src="./images/XSUAA_AD04.png" width="250"/>](./images/XSUAA_AD04.png?raw=true) | [<img src="./images/XSUAA_AD05.png" width="250"/>](./images/XSUAA_AD05.png?raw=true) | [<img src="./images/XSUAA_AD06.png" width="250"/>](./images/XSUAA_AD06.png?raw=true) |
| [<img src="./images/XSUAA_AD07.png" width="250"/>](./images/XSUAA_AD07.png?raw=true) | [<img src="./images/XSUAA_AD08.png" width="250"/>](./images/XSUAA_AD08.png?raw=true) | [<img src="./images/XSUAA_AD09.png" width="250"/>](./images/XSUAA_AD09.png?raw=true) |


## 4. Further Information

Please use the following links to find further information on the topics above:

* [SAP Help - Configure Trust with SAML 2.0 Corporate Identity Provider](https://help.sap.com/docs/IDENTITY_AUTHENTICATION/6d6d63354d1242d185ab4830fc04feb1/33832e58695345eea2cd91a2cc8ab24c.html?locale=en-US)
* [SAP HANA Academy - Azure AD as IdP and SAP Identity Authentication Service as SAML Federation Proxy](https://www.youtube.com/watch?v=4qo8acsxRgU)
* [SAP HANA Academy - Using Azure AD as Identity Provider](https://www.youtube.com/watch?v=KvAzoGHKPA0)
* [SAP Tutorial Navigator - Connect Azure Active Directory to Identity Authentication Service](https://developers.sap.com/tutorials/cp-ias-azure-ad.html)
* [SAP Blog - How to integrate Azure AD with SAP BTP, Cloud Foundry environment](https://blogs.sap.com/2019/03/07/how-to-integrate-azure-ad-with-sap-cloud-platform-cloud-foundry/)
* [Microsoft Documentation - Azure Active Directory single sign-on (SSO) integration with SAP Cloud Identity Services](https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/sap-hana-cloud-platform-identity-authentication-tutorial)
* [SAP HANA Academy - Cloud Identity Services Identity Authentication](https://www.youtube.com/watch?v=2ON6NKyKsSY)