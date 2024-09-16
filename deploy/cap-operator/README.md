# Deploying the application on Kyma using [CAP Operator](https://github.com/SAP/cap-operator)

This document describes how to use the CAP Operator, a Kubernetes native operator, to deploy the application. It should be noted that this tutorial is not valid for deployment to Cloud Foundry. The CAP Operator can be installed and used on any Kubernetes cluster, but for the purpose of this tutorial we focus on a Kyma cluster which brings in prerequisites like Istio (service mesh) and can provide visual insights with Kyma Dashboard views included with the CAP Operator. 

At a very high level, the CAP Operator allows you to describe your application as Custom Resources (similar to Kubernetes native resources), namely `CAPApplication` and `CAPApplicationVersion`. The operator then spins up different workloads (native Kubernetes `Deployments` or `Jobs`) based on your specification along with additional aspects like networking resources (`VirtualServices`, `NetworkPolicies`, `Certificates` etc.). This allows application developers to focus on defining the application in a simplified manner whereas other aspects of managing an application running on Kubernetes is automated by the operator in a manner which is acceptable for most multi-tenant CAP applications.

For example, the CAP Operator integrates with the BTP SaaS Provisioning service to execute the `cds/mtxs` based provisioning operation as well set up additional networking resources which are required for a newly provisioned consumer tenant. Another notable aspect is how the CAP Operator executes an upgrade, when a new `CAPApplicationVersion` is defined, by scheduling independent tenant upgrades (`Jobs`) while the tenant continues to operate with the last version, till the upgrade was successful. For more details, refer to the CAP Operator [documentation](https://sap.github.io/cap-operator/).

## Installing the CAP Operator on your Kyma cluster

The CAP Operator can be [installed](https://sap.github.io/cap-operator/docs/installation/) on Kubernetes clusters using the provided Helm chart. But, for Kyma clusters, CAP Operator offers a managing component which also allows to upgrade the operator and which include Uis to visualize your applications and tenants through the Kyma dashboard.

Execute the following steps to install the latest version of the CAP operator.

```
## installs the cap-operator-manager ##
kubectl apply -f https://github.com/SAP/cap-operator-lifecycle/releases/latest/download/manager_manifest.yaml
```

```
## installs the cap-operator based on your cluster configuration ##
kubectl apply -n cap-operator-system -f https://github.com/SAP/cap-operator-lifecycle/releases/latest/download/manager_default_CR.yaml
```

> NOTE: The (second) command above, applies a custom resource which specifies how CAP Operator will be installed on your cluster. The resource looks something like this:
  ```yaml
  apiVersion: operator.sme.sap.com/v1alpha1
  kind: CAPOperator
  metadata:
    name: cap-operator
  spec:
    subscriptionServer:
      subDomain: cap-op # -> this exposes a domain cap-op.<kyma-cluster-domain> which can be called from SaaS Provisioning service during tenant subscription
    ingressGatewayLabels: # -> these are the label values used to identify the ingress gateway pods/service configured during istio installation; you do not have to change this for Kyma clusters
    - name: istio
      value: ingressgateway
    - name: app
      value: istio-ingressgateway
  ```
  If you would like to you can modify the resource attribute `spec.subscriptionServer.subDomain` to expose a different sub-domain for tenant subscription.

## Building Container Images for you application

This section uses [Docker](https://docs.docker.com/get-started/get-docker/) to build you container images.

To build your images execute the following command:
```
## execute from deploy/cap-operator ##
npx cross-env IMAGE_PREFIX=<your-docker-registry> IMAGE_TAG=0.0.1 npm run build:all
```

To push the container images to your registry (repository from which it can be pulled to the cluster) execute the following command:
```
## execute from deploy/cap-operator ##
npx cross-env IMAGE_PREFIX=<your-docker-registry> IMAGE_TAG=0.0.1 npm run push:all
```

## Deploying the application

1. Create a new namespace.
    ```
    ## create a new namespace with name "susaas" ##
    kubectl create namespace susaas

    ## label the namespace to enable istio sidecar injection for workloads running in the namespace ##
    kubectl label namespace susaas istio-injection=enabled
    ```

2. Create an image pull secret which holds credentials to authenticate the image pull operation from your image repository
    ```
    ## creates a secret "regcred" with credentials for your repository ##
    kubectl create secret docker-registry regcred \
        --docker-server=<image-repository-url> \
        --docker-username=<image-repository-user> --docker-password=<image-repository-password> \
        --docker-email=<email-id>
    ```

3. We will use the Helm chart provided at `deploy/cap-operator/chart` to deploy the application. As you may know, Helm is at a very basic level a templating tool which allows you to create Kubernetes resources by merging provided values into the templates. Next, let us prepare a values file.
   Create a file `values-private.yaml` at `deploy/cap-operator/chart` by filling out the following stub.
    ```yaml
    ### file: ./deploy/cap-operator/chart/values-private.yaml

    app:
        name: susaas-demo # -> set an application name, which will be used within service instances like xsuaa, saas-registry etc.
        domains:
            primary: susaas.<your-kyma-cluster-domain> # -> the main domain where the application is exposed
            secondary: []
        subscriptionServerDomain: cap-op.<your-kyma-cluster-domain> # -> the domain where the cap-operator subscription server is exposed; make sure the subdomain matches any changes you may have done during cap-operation installation

    btp:
        globalAccountId: <mandatory> # -> global account id where the provider sub-account is created  
        provider:
            subdomain: <mandatory> # -> subdomain of the provider sub-account
            tenantId: <mandatory> # -> tenant id if the provider sub-account

    # common labels for the workloads 
    appLabels:
        app.kubernetes.io/name: susaas
        app.kubernetes.io/instance: susaas-demo

    registrySecrets: # -> image pull secrets to be used for the workloads
        - regcred

    # The following sections describe how the container images are used and related configuration
    srv: # -> server workload details (CAP) 
        replicas: 1
        image: "<your-docker-registry>/capop-susaas-srv"
        tag: "0.0.1"

    router: # -> app-router workload details
        externalSessionManagement: # -> set to false for now; an advanced tutorial to scale the app-router is in the works
            enabled: "false"
        replicas: 1
        image: "<your-docker-registry>/capop-susaas-router"
        tag: "0.0.1"

    api: # -> api workload details
        replicas: 1
        image: "<your-docker-registry>/capop-susaas-api"
        tag: "0.0.1"

    broker: # -> service broker workload details
        replicas: 1
        image: "<your-docker-registry>/capop-susaas-broker"
        tag: "0.0.1"
        catalog:
            serviceId: # -> set a guid; try https://www.uuidgenerator.net/
            plans:
                default:
                    id: # -> set a guid; try https://www.uuidgenerator.net/
                trial:
                    id: # -> set a guid; try https://www.uuidgenerator.net/
                premium:
                    id: # -> set a guid; try https://www.uuidgenerator.net/
        credentials:
            user: # -> set a user name to access the service broker
            password: # -> set a password to access the service broker
  

    hdiDeployer: # -> db-com (hdi-deployer) job details
        image: "<your-docker-registry>/capop-susaas-db-com"
        tag: "0.0.1"

    html5AppsDeployer: # -> html5 apps deployer (job) details
        image: "<your-docker-registry>/capop-susaas-html5-deployer"
        tag: "0.0.1"
   ```

4. To deploy the application, install the Helm chart to your cluster. This step will not only create the resources managed by the CAP operator, but also create the required service instances and bindings managed by the [SAP BTP Service Operator](https://github.com/SAP/sap-btp-service-operator).
    ```
    ## execute from deploy/cap-operator to create a helm release names "susaas" ##
    helm upgrade -i -n susaas susaas chart -f chart/values-private.yaml
    ```

That is it! The CAP Operator will now be creating the various workloads, networking and trying to provision the provider tenant which can be used as soon as it is ready.
Read on for more insights into how to to provision tenants, upgrade etc.

# Verifying the deployed application - and Kyma Dashboard views

**COMING SOON...**