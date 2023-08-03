# Prepare the Provider Subaccount

- ### **Kyma** ✅
- ### **Cloud Foundry** ✅

In this chapter, you will learn how to prepare your SAP BTP Provider Subaccount for the deployment of the SaaS solution by assigning the additional entitlements required for the **Advanced Version**.

- [Prepare the Provider Subaccount](#prepare-the-provider-subaccount)
  - [1. Prerequisites for Provider Subaccount](#1-prerequisites-for-provider-subaccount)
  - [2. Entitlements for Advanced Version](#2-entitlements-for-advanced-version)
  - [3. SAP S/4HANA System](#3-sap-s4hana-system)
  - [4. Limitations of free services plans](#4-limitations-of-free-services-plans)
  - [5. Further information](#5-further-information)


## 1. Prerequisites for Provider Subaccount

As already mentioned, also the **Advanced Version** of this tutorial can be deployed to any SAP BTP environment using **Free (Tier) service plans** of your own **Pay-as-you-Go** (PAYG) or **CPEA** account. A tutorial how to setup a PAYG account (allowing you to use all Free Tier service plans) can be found in the [Tutorial Navigator](https://developers.sap.com/tutorials/btp-free-tier-account.html). A deployment to **Trial** Accounts is also possible, though it is not recommended due to limited resource availability (e.g., 14 days in case of Kyma).

**Important** - Please make sure you successfully set up the **Basic Version** of this tutorial before you get started with the **Advanced Version**. All entitlements listed in the Basic Version details ([click here](../../2-basic/2-prepare-provider-subaccount/README.md)) are also required for the Advanced Version.


## 2. Entitlements for Advanced Version

Depending on which of the Advanced Version features you would like to set up, the following additional entitlements are required in your Provider Subaccount. 

| Service                                                                                                         | Free (Tier) / Trial Plans                            |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)         | Free (Application) <br> *Trial: trial (Application)* |
| [Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all) | default (Application) <br> Application               |
| SAP S/4HANA 2021 (or newer)                                                                                     |                                                      |
|                                                                                                                 |

Please check the below details on these additional entitlements required for the Advanced Version. Especially using the **Cloud Identity Services** it is essential to understand the licensing model to remain within the **free** usage boundaries! 


**SAP Integration Suite** 
> The **free service plan** is usable for 90 days only. Your tenant will be decommissioned after 90 days and you need to set up a new tenant if you wish to do further validations. 

**Cloud Identity Services**

> When signing up for a PAYG or CPEA account, you're entitled for **one free** test and productive **SAP Identity Authentication Service (SAP IAS)** tenant. Use the **Cloud Identity Services** plan **default (Application)** to create such an instance in your environment. Any further tenant can be licensed as **Additional Tenant** and will be charged according to your account type. Please also check the official SAP Help documentation ([click here](https://help.sap.com/docs/IDENTITY_AUTHENTICATION/6d6d63354d1242d185ab4830fc04feb1/93160ebd2dcb40e98aadcbb9a970f2b9.html?locale=en-US#loio93160ebd2dcb40e98aadcbb9a970f2b9__licensing_section)) and the following blog post ([click here](https://blogs.sap.com/2021/10/26/is-sap-cloud-identity-services-for-free/)) for further information. Please check for potentially existing SAP IAS tenants first, to make sure you are sticking to the free service offering limits. 
> 
> Using the **SAP Identity Authentication Service**, please make sure to comply with the license model, which is highly dependent on the application registration type created in SAP IAS. Using SAP IAS for authentication scenarios involving third-party solutions will result in costs! While SAP Cloud to SAP Cloud Log-ons are usually part of your overall SAP BTP contract, make sure you understand the licensing model before extensively using SAP IAS as part of your overall architecture. Additional information can be found in SAP Help ([click here](https://help.sap.com/docs/identity-authentication/identity-authentication/tenant-model-and-licensing?locale=en-US)).
>
> The service plan **application** allows you to create respective Service Instances within SAP BTP, that will automatically register an application in the **trusted** SAP IAS tenant configured in your Subaccount configuration. 

**SAP S/4HANA** 

> An SAP S/4HANA system is actually not part of your SAP BTP Provider Subaccount, but is required if you want to test the automated data push feature from an existing SAP On-Premise solution. While we recommend to use at least the SAP S/4HANA 2021 release, with a bit of coding effort you should also be able to integrate older releases. This tutorial assumes you have at least access to an SAP S/4HANA 2021 release. Feel free to check out the SAP Cloud Appliance Library (https://cal.sap.com/) to get yourself a free test license. 


## 3. SAP S/4HANA System

> **Hint** - If you do not have access to an SAP S/4HANA system, you can also use the provided HTTP sample requests (located in the [*code/test/http*](../../../code/test/http/) directory), to inject some mock data into your SaaS application, leveraging the SaaS API from a subscriber perspective.

If you want to test the automated data push feature from an existing SAP solution, the sample setup requires a SAP solution that contains the Enterprise Procurement Model (EPM) model. The EPM is a demo application that integrates many SAP NetWeaver technologies that are used by SAP S/4HANA applications. It is based on a common business process model and follows the business object (BO) paradigm to support well-defined business logic.

In this sample application you will learn how to [push EPM sample data to the SaaS API](../3-push-data-s4hana-system/README.md) to migrate your business data to the multitenant business application for the sustainability calculations. You can use all **SAP S/4HANA** releases and also any other SAP systems which has an **SAP NetWeaver** stack version higher than 7.3. since these versions, all contain the EPM module by default. 

> **Important** - This steps described in this tutorial assume that you are using **at least the 2021** version of SAP S/4HANA. Some features (like the **OAuth Settings** in SM59) are only available since the SAP S/4HANA 2021 release. If your system is based on an older release, you need to invest some coding effort to implement the respective OAuth flows in ABAP yourself. Please check the community for blogs and tutorials on **Configuring OAuth 2.0 and Creating an ABAP Program That Uses OAuth 2.0 Client API**, which should give you a good idea how to set up a Client Credential flow in ABAP. 


## 4. Limitations of free services plans

As already mentioned in the Basic Version, there are certain limitations when using SAP BTP Free (Tier) services plans. Therefore, in context of the **Advanced Version**, please be aware of the following additional limitations:

- Free **SAP Integration Suite** instances are being decommissioned after 90 days! Please make sure to backup your developments to upload them to a new instance if required! 
- **SAP Identity Authentication** tenants in Trial environments have a few limitations, which can be found in SAP Help ([click here](https://help.sap.com/docs/identity-authentication/identity-authentication/tenant-model-and-licensing#trial-tenant)).


## 5. Further information

Please use the following links to find further information on the topics above:

* [SAP Help - SAP Integration Suite](https://help.sap.com/docs/SAP_INTEGRATION_SUITE?locale=en-US)
* [SAP Help - SAP Integration Suite - Using Free Service Plans](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/51ab953548be4459bfe8539ecaeee98d/ddf66923270b4078ac6b88026553d068.html?locale=en-US)
* [SAP Help - SAP Cloud Identity Services](https://help.sap.com/docs/SAP_CLOUD_IDENTITY?&locale=en-US)
* [SAP Cloud Identity Services - Identity Authentication](https://help.sap.com/docs/IDENTITY_AUTHENTICATION?locale=en-US)
* [SAP Help - Enterprise Procurement Model](https://help.sap.com/docs/ABAP_PLATFORM_NEW/a602ff71a47c441bb3000504ec938fea/124a3cf203d64d3198b5bcc9570f31ac.html?locale=en-US)
* [SAP Help - ABAP Platform and SAP NetWeaver](https://help.sap.com/docs/SAP_NETWEAVER?locale=en-US)
* [SAP Help - SAP NetWeaver Application Server for ABAP 7.52](https://help.sap.com/docs/SAP_NETWEAVER_AS_ABAP_752?locale=en-US)