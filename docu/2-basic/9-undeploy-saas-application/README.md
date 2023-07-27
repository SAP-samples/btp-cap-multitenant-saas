# Optional - Undeploy the SaaS Application

> **Important** - If you are planning to setup the **Advanced Version** next, please consider this part of the tutorial optional!

If you want to undeploy the SaaS application and all related services and resources from your Kmya Cluster or Cloud Foundry environment, please follow the steps below. 

- [Optional - Undeploy the SaaS Application](#optional---undeploy-the-saas-application)
  - [1. Undeploy the SaaS application](#1-undeploy-the-saas-application)
  - [2. Check successful Undeployment](#2-check-successful-undeployment)
  - [3. Further Information](#3-further-information)

> **Important** - For the undeployment of a SaaS solutions from your Kyma Cluster or Cloud Foundry Environment, it is **essential** that all **Service Bindings** and **Service Instances** are deleted first, followed by deleting all existing **SaaS subscriptions** in each Consumer Subaccount! Otherwise, existing credential clones (e.g., created by XSUAA during the subscription dependency callbacks) will not be properly removed and corresponding Services Instances cannot be deleted without further ado!


## 1. Undeploy the SaaS application

1.1. Delete all API Service instances from the **Consumer Subaccounts** before undeploying.

1.2. Make sure you unsubscribed from the SaaS application in all **Consumer Subaccounts** before starting the undeployment. 

> **Hint** - You can check and also remove existing subscriptions using the Subscription Management Dashboard ([click here](https://help.sap.com/docs/btp/sap-business-technology-platform/using-subscription-management-dashboard) for details). 

1.3. Ensure that your API Service Broker is properly unregistered ([click here](../9-unsubscribe-consumer-subaccount/README.md#2-check-successful-unsubscription)) from all **Consumer Subaccounts**. 

**Kyma** 

1.4. Uninstall the Helm Release of your SaaS application from the Kyma Cluster of your **Provider Subaccount** by running the following command. 

```sh
helm uninstall susaas -n <Namespace>
```

Optional - Undeploy the SAP Alert Notification Service Instance from the Kyma Cluster of your **Provider Subaccount** by running the following command. 

```sh
helm uninstall alert-notification -n <Namespace>
```

**Cloud Foundry**

1.4. Undeploy the SaaS application from the Cloud Foundry environment of your **Provider Subaccount**. 

```
$ cf login -a https://api.cf.<<region>>.hana.ondemand.com
$ cf undeploy susaas --delete-services --delete-service-keys
```

> **Warning** - Please make sure to have the latest version of the Cloud Foundry CLI installed and your **multiapps plugin** ([click here](https://help.sap.com/docs/btp/sap-business-technology-platform/install-multiapps-cli-plugin-in-cloud-foundry-environment)) is up-to-date. In older versions of the multiapps plugin, the option --delete-service-keys does not exist yet! 


## 2. Check successful Undeployment

**Cloud Foundry**

Check within the SAP BTP Cockpit or using the Cloud Foundry CLI, whether all Applications, Services Instances and Service Bindings have been successfully removed from your Cloud Foundry environment in your Provider Subaccount. If any artifacts remain, please try to delete them manually. Please make sure to delete them manually in the following order:

- Application instances
- Service keys
- Service instances

In case of failed deletions, please check the **General** section below!  

**Kyma**

Check within your Kyma Cluster, whether all Service Bindings, Service Instances, Secrets and Deployments have been successfully remove. If there are any artifacts remaining in the Kyma Cluster of your Provider Subaccount, please delete them in the following order:

- Application workloads (Jobs, Deployments, ReplicaSets, Pods)
- SAP BTP Service Bindings
- SAP BTP Service Instances

Also double-check if all Istio-related objects as well as Network Policies and Config Maps have been successfully removed. In case of failed deletions, please check the **General** section below!  


**General**

You might face a scenario, in which the deletion of the Authorization & Trust Management, the SaaS Provisioning or Destination Service fails. This happens if you did not properly unsubscribe all existing SaaS tenants or did not unregister all Service Broker registrations in the respective subaccounts. 

To unregister existing Service Broker registrations, please re-deploy the application and unregister the remaining Service Broker registrations using e.g., the SAP BTP CLI. If existing Consumer Subaccount subscriptions have not been properly removed, you can follow the same approach and remove the subscriptions after re-deployment. Alternatively, you can also use the Subscription Management Dashboard and delete the remaining subscriptions by skipping the dependency callback. 


## 3. Further Information

Please use the following links to find further information on the topics above:

* [SAP Help - Undeploy Content](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/fab96a603a004bd992822c83d4b01370.html?locale=en-US)
* [Cloud Foundry Documentation - Using the Cloud Foundry Command Line Interface (cf CLI)](https://docs.cloudfoundry.org/cf-cli/)
* [Cloud Foundry Documentation - CLI Reference Guide (v7)](https://cli.cloudfoundry.org/en-US/v7/)
* [Cloud Foundry Documentation - CLI Reference Guide (v8)](https://cli.cloudfoundry.org/en-US/v8/)