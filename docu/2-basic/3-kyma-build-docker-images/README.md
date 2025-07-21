# Kyma - Build, Pack and Push your Docker Images

- **Kyma** ✅ 
- **Cloud Foundry** ❌

**Important** - This part of the tutorial is required for **Kyma** deployments only!

As you might know, Kubernetes and therefore also Kyma is all about **containerization** of workloads. Our application is no exception from this pattern, so before you can deploy the SaaS sample application to your Kyma Cluster using **Helm**, you first need to build and **containerize** the various components (UI modules, CAP applications, Application Router aso.) by **packing** them into a **Docker Image** and **pushing** this Docker Image to a Container Registry of your choice like e.g., DockerHub. This is what the following chapter will be all about!

- [Kyma - Build, Pack and Push your Docker Images](#kyma---build-pack-and-push-your-docker-images)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Build your components](#2-build-your-components)
  - [3. Create your Docker Images](#3-create-your-docker-images)
  - [4. Build details](#4-build-details)
    - [API Service (api)](#api-service-api)
    - [Backend Service (srv)](#backend-service-srv)
    - [Application Router (router)](#application-router-router)
    - [API Service Broker (broker)](#api-service-broker-broker)
    - [HTML5 Apps Deployer (app/html5-deployer)](#html5-apps-deployer-apphtml5-deployer)
    - [HDI Container Deployer (db-com)](#hdi-container-deployer-db-com)
  - [5. Push your Docker Images](#5-push-your-docker-images)
  - [6. Further information](#6-further-information)

Let us have a brief look at the tool prerequisites, which are essential to build and push your containerized components. 

If you are facing any issues during the following steps of our tutorial, please feel free to consult the excellent **Developer Tutorial** on **Deploy Your CAP Application on SAP BTP Kyma Runtime**. It describes similar steps and will get you covered in great detail, in case you get stuck in our sample scenario.

[https://developers.sap.com/tutorials/remote-service-deploy-with-mock-kyma.html](https://developers.sap.com/tutorials/remote-service-deploy-with-mock-kyma.html)

## 1. Prerequisites

First of all, you will need Node.js installed on your device. You can find the latest LTS (long-term support) version ([here](https://nodejs.org/en/download/)). To conduct the upcoming steps, you also need the following tools installed on your device. Follow the linked instructions based on your system environment. 

- Docker ([https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)) - To follow this tutorial on Kyma, you will require an application that allows you to handle container images on your computer, including functions like building, pushing, pulling, and running them. 
- Pack CLI ([https://buildpacks.io/docs/install-pack/](https://buildpacks.io/docs/install-pack/)) - By utilizing Pack, you can construct container images based on collectively maintained base images, resulting in a more straightforward process for maintaining and updating them.
  > **Installation Shortcuts**<br>
  > **MacOS** -  brew install buildpacks/tap/pack <br>
  > **Windows** - choco install pack

- Make must be installed.
  > **Installation Shortcuts**<br>
  > **MacOS** -  brew install make <br>
  > **Windows** - choco install make

> **Important** - Please make sure to comply with the respective **license agreements**, especially when using Docker in an enterprise context!

Before you continue, make sure you can successfully execute the following commands in your command line. Make sure to create a new command line instance for testing the commands. This ensures **Docker** and the **Pack CLI** have been added to your Environment Variables. In case of errors, please make sure that you followed all steps of the instructions provided. 

```sh
> docker
A self-sufficient runtime for containers
...
```

```sh
> pack
CLI for building apps using Cloud Native Buildpacks
...
```

```sh
> make
CLI for executing Makefiles
...
```

Furthermore, please make sure you have access to a Container Registry (e.g. DockerHub) of your choice. You can use the following Docker CLI command to login to your Container Registry. Please consult the documentation of your preferred Container Registry provider to learn more about login requirements.

> **Hint** - If you do not have access to a Container Registry yet, please create a new (free) account e.g., on DockerHub ([click here](https://hub.docker.com/)) or choose a hyperscaler Container Registry by AWS, Azure or GCP. Alternatively, you can also use GitHub to store and manage your Docker images ([learn more](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)).

> **Important** - Please be aware of the fact, that free service providers like DockerHub, only allow you to store a limited number of **private** Docker Images. If your Docker Containers contain sensible information (which they shouldn't) or intellectual property, make sure to choose a service plan or provider that allows you to create **private** Docker Images for your purpose!

```sh
> docker login
...
Login Succeeded
```

Once you successfully installed the required tools (Docker & Pack) and logged in to your Container Registry, you can continue with the next step. 


## 2. Build your components

Let us first build the various components of our SaaS sample application, before containerizing them into Docker Images. 

2.1. (Fork and) Clone our sample [GitHub repository](https://github.com/SAP-samples/btp-cap-multitenant-saas) to your development environment using the below commands. Switch to the *deploy/kyma* directory which contains all objects required for a Kyma deployment. 

```sh
git clone https://github.com/SAP-samples/btp-cap-multitenant-saas
cd code
```

2.2. Run an initial build using the [Makefile](../../../code/Makefile)

```sh
## Run in ./code ## 
make install
make build 
```

> **Info** - This will build your CAP and UI applications.

Alternatively you can also build your apps seperately. Check the [Makefile](../../../code/Makefile) for all available commands.

```sh
make cds-build ## runs cds build
make ui-build ## builds UI apps

```

This is it! The application components requiring a separate **build** step (CAP & UI5) have been catered, and can now be containerized into Container Images. 


## 3. Create your Docker Images

While in Cloud Foundry, there is no requirement to containerize your application components before deployment, in Kyma or respectively Kubernetes, you need to take care of this yourself. While this sounds like a complicated effort, we tried to simplify things as much as we can for you! 

Containerization is required, as during the deployment to your Cluster, Helm will pull the Docker Images of our the sample application components. This includes Docker Image for the following application components:

- API Service (Pod)
- API Service Broker (Pod)
- Application Router (Pod)
- Backend Service (Pod)
- HTML5 Apps Deployer (Job)
- HDI Container Deployer (Job)

These components will be containerized in Docker Images in the following steps. To simplify this process, we are relying on [SAP Standard Docker Images](https://hub.docker.com/u/sapse) or so-called [Cloud Native Buildpacks](https://buildpacks.io/). Using **Cloud Native Buildpacks**, saves you major effort compared to creating and maintaining your own **Dockerfiles**. Instead you will always use latest images provided by the Cloud Native Buildpacks project, which is also part of the [Cloud Native Computing Foundation](https://www.cncf.io/). If you are new to topics like Kubernetes, we strongly recommend to check out both pages to learn more!

> **Important** - To learn more about how the Docker Images for the various components are being build, read the next part of this chapter. 

3.1. Run the following command (from within your *./code* directory), which will *build* all Docker Images using **SAP Standard Docker Images** and **Cloud Native Buildpacks**. 

> **Hint** - If you use e.g. DockerHub as a Container Registry, please put in your **username** (e.g., johndoe) as Container Image Prefix placeholder. If you use the GitHub Container Registry, the prefix will look similar to **ghcr.io/\<namespace>** (e.g. ghcr.io/johndoe). All generated Docker Images will be automatically prefixed with this label!

> **Hint** - Using devices with ARM chips (e.g., Apple M1) the build process involving Cloud Native Buildpacks might take several minutes. Please do not immediately cancel the build if things appear to be stuck, but wait some time for the process to continue (especially while the SBOM is being generated)!

```sh
## Run in ./code ## 
make pack IMAGE_PREFIX=<yourimageprefix>
```

You can check your images by executing:

```sh
docker images | grep 'susaas'

REPOSITORY                            TAG       IMAGE ID       CREATED          SIZE
<yourimageprefix>/susaas-router            latest    86a62f1a4d93   2 hours ago    206MB
<yourimageprefix>/susaas-html5-deployer    latest    abd43b42d0f0   2 hours ago    152MB
<yourimageprefix>/susaas-broker            latest    86f9e9a2dfd3   45 years ago   326MB
<yourimageprefix>/susaas-api               latest    bec89f6ebee5   45 years ago   392MB
<yourimageprefix>/susaas-db-com            latest    ebe1bb0a9543   45 years ago   342MB
<yourimageprefix>/susaas-srv               latest    17396229554c   45 years ago   393MB

```

Alternatively you can also containerize your apps one by one.

```sh
## Run in ./code ## 
make pack-srv IMAGE_PREFIX=<yourimageprefix> ## containerize only srv module
make pack-db-com IMAGE_PREFIX=<yourimageprefix> ## containerize only db-com deployer
make pack-api IMAGE_PREFIX=<yourimageprefix> ## containerize only db-com deployer
make pack-broker IMAGE_PREFIX=<yourimageprefix> ## containerize only service broker
make pack-router IMAGE_PREFIX=<yourimageprefix> ## containerize only approuter
make pack-html5-deployer IMAGE_PREFIX=<yourimageprefix> ## containerize only ui apps and deployer
```


## 4. Build details

As explained, our sample application uses different build tools and approaches to create the required Docker Images, which are **[**Paketo**](https://paketo.io/) backed by [Cloud Native Buildpacks](https://buildpacks.io/)** and official **SAP Standard Docker Images**. This part of the tutorial will provide you some high-level insights on the Docker Image build process of the different components. While it might cause some confusion on first sight, why actually two different approaches are being used to build the required Docker Images, the explanation is fairly simple. 

Building **Dockerfiles** for Kubernetes workloads is not always easy. Especially for beginners in this context! Also the maintenance of Dockerfiles can be time consuming. So whenever we can skip that responsibility and use a vendor-maintained Docker Image (like e.g., [Standard Docker Images](https://hub.docker.com/u/sapse) provided by SAP), we make use of it. For all other components, where SAP is not providing any Standard Docker Images or scenarios where it does not make any sense to do so (e.g., for custom Node.js apps), we make use of [Paketo](https://paketo.io/) and [Cloud Native Buildpacks](https://buildpacks.io/). 

Once again, I highly suggest to have a quick break and scroll through the excellent blog post of Maximilian Streifeneder, who gets you covered on the topic of Paketo as well as some nice little tricks how to further analyze generated Docker Images!

[https://community.sap.com/t5/technology-blogs-by-sap/surviving-and-thriving-with-the-sap-cloud-application-programming-model/ba-p/13570264](https://community.sap.com/t5/technology-blogs-by-sap/surviving-and-thriving-with-the-sap-cloud-application-programming-model/ba-p/13570264)

Docker Images created using Paketo and Cloud Native Buildpacks are secure, efficient, production-ready and come with a lot of features, which are hard to provided using Dockerfiles and would require much more manual effort. To get an idea of the features provided by Cloud Native Buildpacks, check out the official documentation ([click here](https://buildpacks.io/features/)). To learn about the general concepts behind Cloud Native Buildpacks (turning your source-code into a read-to-use Docker Image), check out the respective documentation ([click here](https://buildpacks.io/docs/for-app-developers/concepts/)).

So much for the introduction. Let us now check, how the various components of our SaaS sample application are being containerized either using Paketo and Cloud Native Buildpacks or existing SAP Standard Docker Images. 

### API Service (api)

> Build using Paketo and Cloud Native Buildpacks

As the API Service is based on CAP and Node.js, for the initial build or any changes, you first need to run a **cds build --production**. After running the CDS build (compiling the CDS files of our CAP Backend, CAP API, Tenant and shared data model), the API Service Docker Image is build using Paketo and Cloud Native Buildpacks.

This simplifies the containerization process and allows you to build a Docker Image without the necessity of maintaining a separate Dockerfile for Node.js workloads. During the build process, Paketo will take the content of the *gen/api* directory and put it into the working directory of a Node.js Docker Image. This image is based on the latest and stable Cloud Native Buildpacks. 

**Make command to build the Docker Image using Paketo** ([*/code/Makefile*](../../../code/Makefile))

```sh
make pack-api IMAGE_PREFIX=<yourimageprefix>
```

This make command runs following command for you under the hood.

```sh
pack build $(IMAGE_PREFIX)/susaas-api --path gen/api \ 
--builder paketobuildpacks/builder-jammy-base \ 
--buildpack paketo-buildpacks/nodejs -e \
BP_LAUNCHPOINT=./node_modules/@sap/cds/bin/serve.js
```

>**Hint** - The *paketobuildpacks/builder-jammy-base* provides a minimal Docker Image based on Ubuntu, with the addition of a few packages (so-called "mixins") ([click here](https://hub.docker.com/r/paketobuildpacks/builder) for more details).


### Backend Service (srv)

> Build using Paketo and Cloud Native Buildpacks

As the central Backend Service is also based on CAP, for the initial build or any changes, you first need to run a **cds build --production**. After running the CDS build (compiling the CDS files of our CAP Backend, CAP API, Tenant and shared data model), also for the Backend Service, Paketo and Cloud Native Buildpacks are used to create a Docker Image. 

Doing so (as for the API Service), a Docker Image can be build without having to maintain a separate Dockerfile. During the build process, Paketo will take the content of the *gen/srv* directory, and place it into the working directory a Node.js Docker Image. Again, this image is based on the latest and stable Cloud Native Buildpacks.

**Make command to build the Docker Image using Paketo** ([*/code/Makefile*](../../../code/Makefile))

```sh
make pack-api IMAGE_PREFIX=<yourimageprefix>
```
This make command runs following command for you under the hood.

```sh
pack build $(IMAGE_PREFIX)/susaas-srv --path gen/srv \ 
--builder paketobuildpacks/builder-jammy-base \ 
--buildpack paketo-buildpacks/nodejs -e \
BP_LAUNCHPOINT=./node_modules/@sap/cds/bin/serve.js
```

### Application Router (router)

> Build using SAP-provided Standard Docker Image

The Application Router Docker Image is based on SAP's standard *sapse/approuter* Docker Image which can be found in Docker Hub ([https://hub.docker.com/u/sapse](https://hub.docker.com/u/sapse)). As this official Docker Image is **optimized and maintained by SAP**, there is no need to make use of Cloud Native Buildpacks for a stable, secure and up-to-date base images.

Therefore, we created a tiny Dockerfile which is using the official SAP Docker Image (*sapse/approuter*), and only adds our own static Application Router resources to the working directory of the Docker Image. In this case, the custom Dockerfile is required to copy the whole content of the *router* directory, except for the package.json (part of .dockerignore file) to the resulting Docker Image. 

> **Hint** - The package.json file is part of the directory for local testing purposes only. As the SAP-managed Docker Image *sapse/approuter* already contains a package.json file, we will reuse the start script of this SAP-provided package.json scripts.

**Dockerfile based on sapse/approuter Docker Image** ([*/code/router/Dockerfile*](../../../code/router/Dockerfile))

```Dockerfile
# Image based on SAP provided sapse/approuter image
# Make sure to update the Docker Image version regularly
FROM sapse/approuter:x.x.x

# Create an app directory (in case not there yet)
RUN mkdir -p /app
# Grant default non-root user ("node") permissions
RUN chown node.node /app

# Set working directory for COPY and CMD command
WORKDIR /app

# Copy local directory where Dockerfile resides to Docker Image
# -> Includes the resources folder and the xs-app.json file
COPY . .
# Run npm start script to start the Application Router
CMD [ "npm", "start" ]
```

**Build Docker Image based on Dockerfile above** ([*/code/Makefile*](../../../code/Makefile))

> **Hint** - This following make command will build a Docker Image based on the Dockerfile located in the */code/router* directory and will tag it with *sap-demo/susaas-router*. "sap-demo" has to be replaced by the prefix also used in step 3.1, if you want to run this command standalone.

```sh
make pack-router IMAGE_PREFIX=<yourimageprefix>
```
This make command runs following command for you under the hood.

```sh
docker build -t $(IMAGE_PREFIX)/susaas-router ./router
```


### API Service Broker (broker)

> Build using Paketo and Cloud Native Buildpacks

For the API Service Broker (which is actually just a generic Node.js workload based on the *@sap/sbf* npm module - [click here](https://www.npmjs.com/package/@sap/sbf) for details), again Paketo and Cloud Native Buildpacks are used to build the required Docker Image. 

This way (as for the API and SaaS Backend Service), a Docker Image can be build without maintaining a separate Dockerfile. During the build process, Paketo will take the content of the *broker* directory, and place it into the working directory of a Node.js Docker Image. This Docker Image is again based on the latest Cloud Native Buildpacks. 

**Make command to build the Docker Image using Paketo** ([*./code/Makefile*](../../../code/Makefile))

```sh
make pack-broker IMAGE_PREFIX=<yourimageprefix>
```

This make command runs following command for you under the hood.

```sh
pack build $(IMAGE_PREFIX)/susaas-broker --path ./broker \ 
--builder paketobuildpacks/builder-jammy-base \ 
--buildpack paketo-buildpacks/nodejs -e \
BP_LAUNCHPOINT=./start.js
```



### HTML5 Apps Deployer (app/html5-deployer)

> Build using SAP-provided Standard Docker Image

The HTML5 Apps Deployer Docker Image of our sample is (like the Application Router) based on SAP's official *sapse/html5-app-deployer* Docker Image which can be found in Docker Hub ([https://hub.docker.com/u/sapse](https://hub.docker.com/u/sapse)). The purpose of the HTML5 Apps Deployer is actually pretty simple. The HTML5 Apps Deployer is based on an npm package ([click here](https://www.npmjs.com/package/@sap/html5-app-deployer) for details), which will take our zipped UI5 modules and deploys them into the HTML5 App Repository Service, which will be bound to the respective Kyma workload.

As this Docker Image is maintained by SAP, there is no need to make use of Cloud Native Buildpacks for stable, secure and up-to-date base image. Therefore, we created a Dockerfile which is based on the official SAP Docker Image (*sapse/html5-app-deployer*), and only add our own *resources* folder to the working directory of the resulting Docker Image. 

The *resources* folder (within the *code/app/html5-deployer* directory) contains the zipped UI5 modules (which you need to build upfront using the *npm run ui:apps* script - [see here](#2-build-your-components)). If you followed all previous tutorial steps, the respective zip files should already exist, as the respective command will automatically run the *build* scripts in the *package.json* files of our UI5 modules.

**Make command to trigger the build of a single UI module** ([*/code/Makefile*](../../../code/Makefile))

```sh
make ui-admin-projects
```

**Npm scripts to build a UI module and copy zip to html5 app deployer** ([*/code/app/ui-admin-projects/package.json*](../../../code/app/ui-admin-projects/package.json))

```json
"scripts": {
    "build:copy": "npm run build && npm run copy",
    "build": "ui5 build preload --clean-dest --config ui5-deploy.yaml --include-task=generateCachebusterInfo",
    "copy": "shx mkdir -p ../html5-deployer/resources/ && shx cp -rf ./dist/*.zip ../html5-deployer/resources/"
}
```

Similar to the Application Router, the Dockerfile residing in the *code/app/html5-deployer* folder, copies the *html5-deployer* directory content into the working directory of the resulting Docker Image, which is based on the SAP-managed *sapse/html5-app-deployer* image.

> **Hint** - The package.json file is part of the *code/app/html5-deployer* directory for local testing purposes only. As the Docker Base Image *sapse/html5-app-deployer* already contains a corresponding package.json file, we will reuse the start script of this SAP-provided package.json.

**Dockerfile based on sapse/html5-app-deployer Docker Image** ([*/code/app/Dockerfile*](../../../code/app/Dockerfile))

```Dockerfile
# Image based on SAP provided sapse/html5-app-deployer image
# Make sure to update the Docker Image version regularly
FROM sapse/html5-app-deployer:x.x.x

# Create the app directory (in case not there yet)
RUN mkdir -p /app
# Grant default non-root user ("node") permissions
RUN chown node.node /app

# Set the working directory for COPY and CMD command
WORKDIR /app

# Copy the directory where Dockerfile resides to the Docker Image
# -> Includes the resources directory with the zipped UI5 modules
COPY . .
# Run npm start script to start the Application Router
CMD [ "npm", "start" ]
```

**Build Docker Image based on Dockerfile above** ([*/code/Makefile*](../../../code/Makefile))

```sh
make pack-html5-deployer IMAGE_PREFIX=<yourimageprefix>
```

This runs following command under the hood for you.

```sh
docker build -t $(IMAGE_PREFIX)/susaas-html5-deployer ./app
```

### HDI Container Deployer (db-com)

> Build using Paketo and Cloud Native Buildpacks

As the data model of the shared database container is also based on CAP, for the initial build or any changes, you first need to run **cds build --production**. While the Tenant specific data model will be automatically deployed to isolated HDI containers upon subscription, the shared data model has to be deployed (into a dedicated HDI Container) separately. Therefore, the default *@sap/hdi-deploy* npm package ([click here](https://www.npmjs.com/package/@sap/hdi-deploy) for details) is being used by this Docker Image.

After running the CDS build (compiling the CDS files of our CAP Backend, CAP API, Tenant and shared data model), the required Docker Image (containing an HDI deployer for the shared data model) is build using Paketo and Cloud Native Buildpacks. This simplifies the build process and allows us to build a Docker Image without the necessity of maintaining a separate Dockerfile. During the build process, Paketo will take the content of the *gen/db-com* directory and place it into the working directory of a Node.js Docker Image. This image is based on the latest Cloud Native Buildpacks. 

**Make command to build the Docker Image using Paketo** ([*/code/Makefile*](../../../code/Makefile))

```sh
make pack-db-com IMAGE_PREFIX=<yourimageprefix>
```

This runs following command under the hood for you

```sh
pack build $(IMAGE_PREFIX)/susaas-db-com --path ./gen/db-com --builder paketobuildpacks/builder-jammy-base --buildpack paketo-buildpacks/nodejs -e BP_LAUNCHPOINT=./node_modules/@sap/hdi-deploy/deploy.js
```

Now you should be covered and well in the know about the different approaches used to containerize our SaaS application components. Let us continue with some more details on how to push your Docker Images to your Container Registry now. 


## 5. Push your Docker Images 

To allow Helm to pull your Docker Images during the deployment process, you need to push them to a Container Registry of your choice. 

> **Hint** - If you are using a **non-public** Docker Registry, we assume you know how to handle the required secrets or access codes. In these scenarios, you might need to adapt the [values.yaml](../../../code/chart/values.yaml) file of your Helm chart. [Check official CAP documentation](https://cap.cloud.sap/docs/guides/deployment/to-kyma#deploy-to-kyma-1) for its usage.

After all your Docker Images are build using **Cloud Native Buildpacks** or **SAP Standard Images**, you can push them to your Container Registry. To do so, please ensure you successfully logged in to your registry of choice (*docker login*) before running the following npm script. 

> **Hint** - If you use e.g. DockerHub as a Container Registry, please put in your **username** (e.g., johndoe) as Container Image Prefix placeholder. If you use the GitHub Container Registry, the prefix will look similar to **ghcr.io/\<namespace>** (e.g. ghcr.io/johndoe). All generated Docker Images will be automatically prefixed with this label!

```sh
## Run in ./code ## 
make push-all IMAGE_PREFIX=<ContainerImagePrefix>

# Example
make push-all IMAGE_PREFIX=sap-demo
```

As an alternative to pushing all Docker Images at once, you can again push images separately by running the component specific make command. Check your [Makefile](../../../code/Makefile) for details. 

> **Hint** - This can be useful if you e.g., updated only a single Docker Image and will save you some time. 

```sh
## Run in ./code ## 
make push-srv IMAGE_PREFIX=<ContainerImagePrefix> 

# Example
make push-srv IMAGE_PREFIX=sap-demo 
```

Well, this is it! Once the npm script has finished, your Docker Images should be available in your Container Registry. You have successfully containerized all application components can start deploying the SaaS sample application to your Kyma Cluster. Let's move on to the actual deployment!


## 6. Further information

Please use the following links to find further information on the topics above.
