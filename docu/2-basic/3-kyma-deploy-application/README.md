# Kyma - Deploy the SaaS application

- **Kyma** ✅ 
- **Cloud Foundry** ❌

**Important** - This part of the tutorial is required for **Kyma** deployments only!

Before you deploy the sample application to your **SAP BTP, Kyma Runtime**, please make sure you completed the previous tutorial chapter. Your Docker Images have to be available in your Container Registry, so Helm can access and pull them during the upcoming deployment. 

- [Kyma - Deploy the SaaS application](#kyma---deploy-the-saas-application)
  - [1. Introduction](#1-introduction)
  - [2. Create a new Kyma namespace](#2-create-a-new-kyma-namespace)
  - [3. Prepare the Helm deployment](#3-prepare-the-helm-deployment)
  - [4. Deploy to your Kyma Cluster](#4-deploy-to-your-kyma-cluster)
  - [5. Multiple Deployments](#5-multiple-deployments)

> **Important** - The sample application can be deployed multiple times if either the **Release Name**, the **Kyma Namespace** or the **Kyma Cluster** are different. In the latter case, the cluster has to be in a different SAP BTP Subaccount (due to conflicting Role Collection names). 

If you are facing any issues during the following steps of our tutorial, please feel free to consult the excellent **Developer Tutorial** on **Deploy Your CAP Application on SAP BTP Kyma Runtime**. It describes similar steps and will get you covered in great detail, in case you get stuck in our sample scenario.

[https://developers.sap.com/tutorials/remote-service-deploy-with-mock-kyma.html](https://developers.sap.com/tutorials/remote-service-deploy-with-mock-kyma.html)


## 1. Introduction

The deployment of the Sustainable Saas solution to your SAP BTP Kyma Cluster is handled by [Helm](https://helm.sh/). To learn more about the basic concepts of Helm, visit the respective chapter of the tutorial ([click here](../7-kyma-resources-helm/README.md)). Repeating myself, I also suggest to read and inhale the brilliant blog post of Maximilian Streifeneder on the topics of Kyma, Helm, Paketo and a lot more! It will give you a great overview and introduction if you are new to the Kubernetes, Docker and Kyma world!

[https://community.sap.com/t5/technology-blogs-by-sap/surviving-and-thriving-with-the-sap-cloud-application-programming-model/ba-p/13570264](https://community.sap.com/t5/technology-blogs-by-sap/surviving-and-thriving-with-the-sap-cloud-application-programming-model/ba-p/13570264)

Furthermore, if you are facing any issues during the following steps of our tutorial, please feel free to consult the excellent **Developer Tutorial** on **Deploy Your CAP Application on SAP BTP Kyma Runtime**. It describes similar steps and will get you covered in great detail, in case you get stuck in our sample scenario.

[https://developers.sap.com/mission.btp-deploy-cap-kyma.html](https://developers.sap.com/mission.btp-deploy-cap-kyma.html)


Before you proceed with the following steps, please make sure you have successfully built your Docker Images and pushed them to the Container Registry of your choice (e.g., Docker Hub or GitHub). Helm will not make use of your local Docker Images, but will pull the latest Images from the provided registry and deploy them to your Kyma Cluster. 

The following Docker Images should be available in your Container Registry:

- susaas-srv - Backend CAP Service
- susaas-api - API CAP Service
- susaas-broker - API Service Broker
- susaas-router - Application Router
- susaas-db-com - Shared Database Deployer
- susaas-html5-deployer - HTML5 Apps Deployer

Here a sample screenshot taken from Docker Hub. 

[<img src="./images/ImageOverview.png" width="400"/>](./images/ImageOverview.png?raw=true)

During Deployment, Helm will generate the required Kubernetes resources (*manifest files*) based on the provided Helm templates (again - feel free to check out our [Helm Introduction](../7-kyma-resources-helm/README.md)) and deploy them to your Kyma Cluster. This will result in various different objects like **Deployments**, **Jobs** or **SAP BTP Service Instances** or **Bindings**. 

> **Hint** - To learn more about all the various Kyma and native Kubernetes resources utilized by our sample application, please check out the respective deep-dive chapters ([click here](../7-kyma-resources-helm/README.md))! 

**Kubernetes Deployments**

[<img src="./images/Deployments.png" width="400"/>](./images/Deployments.png?raw=true)

- susaas-srv
- susaas-api 
- susaas-broker
- susaas-router 

These workloads are constantly running in your Cluster after deployment, as they need to be contiguously reachable for external traffic. They come with further components like API Rules or Istio related configurations, which are explained in further detail as part of our dedicated Kyma tutorial ([click here](../7-kyma-resources-helm/README.md)). 


**Kubernetes Jobs**

[<img src="./images/JobsOverview.png" width="400"/>](./images/JobsOverview.png?raw=true)

- susaas-hana-deployer
- susaas-html5-apps-deployer

The deployment of the shared data model using the Node.js based HDI Deployer is only required upon initial setup or when any changes are applied to the data model. The same applies for the static UI5 modules. This is why, both applications components are running as Jobs whenever a *helm install* or *helm upgrade* is initiated. After the Jobs finished successfully, they are deleted from the Cluster again. 


**SAP BTP Service Instances/Bindings**

The Helm deployment will create a list of SAP BTP Service Instances and corresponding Service Bindings required by your workloads. While these Service Instances can also be seen from within the SAP BTP Cockpit, the Service Credentials can only be retrieved and accessed from your Kyma Dashboard.

[<img src="./images/ServiceInstancesKyma.png" width="400"/>](./images/ServiceInstancesKyma.png?raw=true)
[<img src="./images/ServiceInstancesCf.png" width="360"/>](./images/ServiceInstancesCf.png?raw=true)

> **Hint** - SAP BTP Service Bindings will create corresponding Kyma Secrets, which are consumed by your Kubernetes workloads (Pods, Jobs) and allow your applications to communicate with the respective SAP BTP Service Instances like you know it from the Cloud Foundry context. Npm packages like @sap/xsenv ([see here](https://community.sap.com/t5/technology-blogs-by-sap/the-new-way-to-consume-service-bindings-on-kyma-runtime/ba-p/13540594)) natively support these kind of Service Bindings in Kyma and Cloud Foundry. Check out Max Streifeneder's blog post ([click here](https://community.sap.com/t5/technology-blogs-by-sap/surviving-and-thriving-with-the-sap-cloud-application-programming-model/ba-p/13570264)), who also provides a great summary of this concept (just search for "How does CAP know where to get the service binding information from?"). 


## 2. Create a new Kyma namespace

Using Helm, you can deploy the SaaS sample application to either the *default* Kyma namespace or create a **new namespace** of your choice for this sample application. In the following, you will learn how to create a new namespace called *susaas* in Kyma. 

2.1. First of all, please install the [**kubectl**](https://kubernetes.io/docs/tasks/tools/#kubectl) command line tool in your development environment. 

> **Hint** - Kubectl allows you to interact with your Kyma Cluster from your command line, as you are used to from any other Kubernetes environment. [Click here](https://kubernetes.io/docs/tasks/tools/#kubectl) to find further information about **kubectl**. Helm will make use of **kubectl** during the deployment process to create the required resources in your Cluster. 

> **Installation Shortcuts**<br>
> **MacOS** - brew install kubectl<br>
> **Windows** - choco install kubernetes-cli

To learn more about **kubectl** commands check the [official documentation](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands) and the [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/). Learning how to use **kubectl** is one of the most essential requirements when starting off with Kubernetes and Kyma. The command syntax is quite simple to understand and follows a consistent pattern. So don't shy to have a little deep-dive into the provided documentations. It pays! 


2.2. Before you continue with the next step, make sure you can successfully execute the following command. This proves that kubectl has been successfully added to your Environment Variables. In case of errors, please try again from a new command line instance and make sure you followed all steps of the kubectl installation instructions.  

```sh
kubectl version

Client Version: version.Info{Major:"1", Minor:"26", ...
```

2.3. To connect to your Kyma Cluster, you have to install another tool called [**kubelogin**](https://github.com/int128/kubelogin#setup). Please use the below shortcuts or the installation details in the linked documentation to proceed. 

> **Installation Shortcuts**<br>
> **MacOS** - brew install int128/kubelogin/kubelogin<br>
> **Windows** - choco install kubelogin

Check the successful installation by running the following command.

```sh
kubelogin

kubelogin version v1.26.0 
```

2.4. Download the so-called **kubeconfig** file of your Kyma Cluster from your SAP BTP Cockpit. You can find it in your SAP BTP subaccount **Overview** section. This file contains all required access details and credentials so that **kubectl** can connect to your Kyma Cluster. 

> **Important** - Do not share this file with anyone else and do not commit it to your GitHub repository.

[<img src="./images/Kubeconfig.png" width="400"/>](./images/Kubeconfig.png?raw=true)


2.5. Once you downloaded the *kubeconfig.yaml* file, please store it as a file named **config** (! without any file name extension !) in your hidden *$HOME/.kube* directory. Kubectl will check this **hidden** directory for an available configuration file named **config**. This is probably the most convenient way to provide your Cluster access details to kubectl. 

> **Hint** - In Windows, the directory is e.g., C:\Users\\<username>\\.kube

Alternatively, you can also configure the location of your configuration file in the environment variable **KUBECONFIG** or by adding the kubectl parameter *--kubeconfig* to any kubectl command (which is obviously a bit cumbersome). 

```sh
EXPORT KUBECONFIG=/sample/path/config

kubectl get pods --kubeconfig=/sample/path/config
```

> **Hint** - If you have to manage multiple Kyma or Kubernetes Clusters, make sure to research the **kubectx** command line tool (https://github.com/ahmetb/kubectx)! It provides you a very convenient way to switch the context between various clusters. 

2.6. Run the following command to check whether kubectl can successfully connect to your cluster using the respective config file.  

> **Hint** - Depending on your landscape, you will need to setup Two-Factor-Authentication using e.g., the SAP Authenticator App. 

```sh
kubectl cluster-info

Kubernetes control plane is running at https://api.a1b2c3.kyma.ondemand.com
```

2.7. The following kubectl command, finally allows you to create a new namespace in your Kyma cluster. To learn more about **kubectl** commands check the [official documentation](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands) and the [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/). 

> **Hint** - This is just a sample for your reference. If you want, you can deploy the sample application also to the Kyma *default* namespace or any other namespace of your choice! Just make sure to adapt the sample commands provided in this documentation accordingly.

```sh
kubectl create namespace mtenant

namespace/mtenant created
```

2.8. Use the following command, to enable the **Istio** Sidecar Injection for your new namespace.

> **Hint** - **Istio** is one of the most popular **Service Mesh** offerings for Kubernetes and manages Cluster-internal communication as well as external access to your workloads! We highly recommend to learn more about [**Istio Service Mesh**](../7-kyma-resources-helm/README.md), by visiting the respective part of the tutorial. The features and possibilities are mind-blowing compared to what you can do in a Cloud Foundry scenario! 

> **Important** - If you plan to use an existing namespace, make sure this label is configured and if necessary, please update the namespace using **kubectl** or the Kyma Dashboard! 

```sh
kubectl label namespace mtenant istio-injection=enabled
```

You can either use **kubectl** or check in your Kyma Dashboard, whether the respective label has been successfully set!

> **Hint** - Here you can see another kubectl command called **describe**, providing you more information (than a simple **get**) about a certain object like in this case a namespace. 

```sh
kubectl describe namespace mtenant

Name:         mtenant
Labels:       istio-injection=enabled
              kubernetes.io/metadata.name=mtenant
```

[<img src="./images/IstioInjectionLabel.png" width="400"/>](./images/IstioInjectionLabel.png?raw=true)


2.9. To delete a namespace, just execute the following **kubectl** command. Already getting an idea about how the kubectl commands are structured? Great! 

> **Important** - Be **extremely sensitive** when deleting a namespace containing a **SaaS application** with **active subscribers**. This can result in very situations, where SAP BTP Service Instances like XSUAA can only be deleted with complex additional effort. Before you **delete a namespace** or **uninstall a Helm Release**, always make sure there are no more active subscribers! 

```sh
kubectl delete namespace mtenant

namespace/mtenant deleted
```

Okay great, by now you should be equipped with either a new namespace or the default Kyma namespace. So let us prepare the SaaS sample application for deployment next. 


## 3. Prepare the Helm deployment

Let's get started with the preparation of our **Helm deployment** or **Helm installation**. Based on your own Kyma environment, you will need to update the *values.yaml* file of your **Umbrella Chart**. This is a regular process step, which you need to undertake as part of almost any Helm installation to inject environment-specific details which cannot be pre-configured by the application/package vendor. 

3.1. In your [**values.yaml**](../../../code/chart/Chart.yaml) file, please provide values for the following parameters, based on your own environment and the Container Registry being used. 

**global**

  * imagePullSecret - Name of a Image Pull Secret if required.

    > **Hint** - This value needs to contain the reference to a potential Image Pull Secret of your Container Registry. If you're using a free Docker Hub account and public Docker Images, this property can be left unchanged (empty object). Otherwise, please make sure to create a Kyma **Secret** containing your imagePullSecret and provide the reference to your Secret here. 
    
    > Find more details in the following blog post ([click here](https://community.sap.com/t5/technology-blogs-by-sap/sap-btp-kyma-kubernetes-how-to-pull-from-private-repository/ba-p/13566191)) or check out the **Deploy Your CAP Application on SAP BTP Kyma Runtime** tutorial in the SAP Tutorial Navigator([click here](https://developers.sap.com/tutorials/remote-service-deploy-with-mock-kyma.html)). Our colleagues will get you covered! 

  * domain - Your Kyma Cluster default or custom domain.

    > **Hint** - This parameter requires your default Kyma cluster domain (e.g. a1b2c3.kyma.ondemand.com). To get the default domain of your Kyma Cluster you can run the following kubectl command: 
    >
    > **kubectl get configMaps/shoot-info -n kube-system -o jsonpath='{.data.domain}'**
    > 
    > This will return the required result like *a1b2c3.kyma.ondemand.com*. *a1b2c3* is a placeholder for a string of characters that’s unique for your cluster (the so-called **shootName** which we need in the next step). 


3.2. This is a one-time action. Let's relax and check if your Kubernetes resource definitions are successfully generated by Helm, running the following command within the *deploy/kyma* directory.

> **Hint** - In case of errors, check if you maybe missed one of the above parameters or a mistake (like a space or special character) has slipped in.

```sh
## Run in ./code ## 
cds build --production
helm template susaas gen/chart -n mtenant
```

This will log the generated **yaml** files in your console. If required, you can also store the results into a local file by running the following command. 

```yaml
## Run in ./code ## 
helm template gen/chart -n mtenant >> mytemplate.yaml
```

Open the generated *mytemplate.yaml* file. Double-check if the correct Docker Image repositories can be found in the generated resource definitions before you continue with the next chapter. 

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - image: sap-demo/susaas-broker:latest
        name: broker
```


## 4. Deploy to your Kyma Cluster

 If you would like to apply any changes to the provided sample application, this is the actual way to proceed. Okay, but finally you should now be all set to deploy the sample application (based on your own Docker Images) to your Kyma Cluster. 

4.1. Please run the following command from within the *./code* directory to deploy the Sustainable SaaS sample application to a namespace of your choice.

> **Hint** - Feel free to add the *--debug* parameter to get some more verbose output if you're interested what's happening under the hood!

```sh
## Run in ./code ## 
helm install <ReleaseName> gen/chart  -n <Namespace>

# Example
helm install susaas gen/chart  -n mtenant

```

An alternative approach using the *helm upgrade* command would look as follows. This will either upgrade an existing installation of our SaaS sample application or install a new version if not available in the respective namespace yet. 

```sh
## Run in ./deploy/kyma ## 
helm upgrade <ReleaseName> gen/chart --install -n <Namespace>

# Example
helm upgrade susaas gen/chart --install -n mtenant
```

4.2. The deployment of the Helm Release to your Kyma cluster, will take a few minutes. 

4.3. You can use this time to switch back to your Kyma Dashboard, where you can monitor the installation/deployment progress and respective objects being instantiated. Once you see the following four **Pods** in **Running** state, your deployment finished successfully. 

> **Trivia** - We're kind of mixing up the terms Deployment/Installation/Release in this tutorial. 

[<img src="./images/PodOverview.png" width="400"/>](./images/PodOverview.png?raw=true)

4.4. You can also check the successful deployment of your application in the **Apps** section of the Kyma Dashboard. Here you can find all **Helm Releases**. 

[<img src="./images/HelmOverview.png" width="400"/>](./images/HelmOverview.png?raw=true)

4.5. For any further updates of the Helm Release, you must now use the *helm upgrade* command (already mentioned above).

```sh
## Run in ./deploy/kyma ## 
helm upgrade <ReleaseName> gen/chart -n <Namespace>

# Example
helm upgrade susaas gen/chart -n mtenant
```

4.6. To undeploy/uninstall a Helm Release, you can use the following command. 

> **Important** - Please make sure to check the respective **Undeploy** chapter of the documentation first! Uninstalling a SaaS application with existing subscribers, can result in corrupt Service Instance setups which are very cumbersome to resolve. 

```sh
# Run anywhere # 
helm uninstall <ReleaseName> -n <Namespace>

# Example
helm uninstall susaas -n mtenant
```


> **Important!:** This application can be only deployed one time into a single namespace.

