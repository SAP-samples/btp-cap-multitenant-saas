# Custom Domain in SAP BTP Kyma Runtime

- **Kyma** ✅
- **Cloud Foundry** ❌

In this part of the tutorial, you will learn how to set up a Custom Domain in your Kyma Cluster using AWS Route 53.

- [Custom Domain in SAP BTP Kyma Runtime](#custom-domain-in-sap-btp-kyma-runtime)
  - [1. Introduction](#1-introduction)
  - [2. Prerequisites](#2-prerequisites)
    - [2.1. Ensure that your domain already registered or transferred to Route53](#21-ensure-that-your-domain-already-registered-or-transferred-to-route53)
    - [2.2. Ensure that you have access to your Kyma Cluster](#22-ensure-that-you-have-access-to-your-kyma-cluster)
    - [3.1. Key Components](#31key-components)
  - [4. Configuration of Custom Domain in Your Kyma Runtime](#4-configuration-of-custom-domain-in-your-kyma-runtime)
    - [4.1. Quick Start](#41-quick-start)
    - [4.2. Manual Step-By-Step Configuration](#42-manual-step-by-step-configuration)
      - [4.2.1. Create Secret](#421-create-secret)
      - [4.2.2. Create DNS Provider](#422-create-dns-provider)
      - [4.2.3 Create DNS Entry](#423-create-dns-entry)
      - [4.2.4. Create Issuer](#424-create-issuer)
      - [4.2.5. Create Certificate](#425-create-certificate)
      - [4.2.6 Create Istio Gateway for Custom Domain](#426-create-istio-gateway-for-custom-domain)
    - [4.3. Expose Your SusaaS Application with your Custom Domain](#43-expose-your-susaas-application-with-your-custom-domain)

## 1. Introduction 

This documentation chapter is your guide to seamlessly integrating custom domains into your SAP BTP Kyma Runtime Cluster. By allowing you to use your registered domains for your Kyma cluster, you can provide a more personalized experience to cater to their specific needs and preferences.
At this tutorial, we will use the registered domain from Amazon Web Services(AWS) Route 53 as DNS Provider and Let's Encrypt as CA. 


## 2. Prerequisites

- You have an AWS Account [and you have access to it via AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-short-term.html).
- You have a [registered](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html#register_new_console) or [transferred](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html) domain in Route 53.
- You have a SAP BTP Kyma Cluster and you also have access to it via kubectl.  
- You have a [deployed SusaaS Application release](../../../2-basic/3-kyma-deploy-application/README.md) running on SAP BTP Kyma Runtime.

Follow the steps below to check if you are eligible to follow this step-by-step guide.

### 2.1. Ensure that your domain already registered or transferred to Route53 

```sh
aws route53 list-hosted-zones
```
Now you should see the output as similar below. Please check if the domain you want to use is there.
```sh
{
    "HostedZones": [
        {
            "Id": "/hostedzone/Z01685663MPP15I02ZWLP",
            "Name": "exampledomain.com.", // your domain value should appear here 
            "CallerReference": "terraform-20210810114821273300000001",
            "Config": {
                "Comment": "Managed by Terraform", 
                "PrivateZone": false
            },
            "ResourceRecordSetCount": 16
        }
    ]
}
```

### 2.2. Ensure that you have access to your Kyma Cluster

Run the command below to check if you are able to connect your Kyma Cluster.

```sh
kubectl get namespaces
```
You should see a similar output as below.
```sh
NAME               STATUS   AGE
default            Active   213d
istio-system       Active   213d
kube-node-lease    Active   213d
kube-public        Active   213d
kube-system        Active   213d
kyma-integration   Active   213d
kyma-system        Active   213d
susaas             Active   169d
```

## 3. Overview and Key Components
SAP Business Technology Platform (BTP) Kyma Runtime provides a cloud-native runtime environment for building, extending, and integrating enterprise applications. One of the key features of Kyma Runtime is the ability to enable custom domain usage. Custom domain enables you to access your Kyma Runtime applications using your own domain name instead of the default system-generated URLs. This enhances the user experience and aligns the application with your organization's branding.

### 3.1. Key Components
To enable custom domain usage in SAP BTP Kyma Runtime, several key components work together to configure and manage the custom domain setup:

**Secret**: A Kubernetes Secret is used to securely store sensitive data, such as access credentials for cloud providers. In the context of custom domain usage, a Secret is used to store the AWS access credentials required for managing DNS records.

**DNSProvider**: The DNSProvider is a Kubernetes custom resource that allows you to manage DNS records in a cloud provider's DNS service. In the case of custom domain usage in Kyma Runtime, the DNSProvider is configured with the AWS Route53 service to handle DNS records for the custom domain.

**DNSEntry**: The DNSEntry is another Kubernetes custom resource used to define DNS records. It specifies the mapping between a domain name (e.g., *.kyma.example.com) and the target endpoint (e.g., istio-ingressgateway) where traffic should be directed. This object modifies yours Route53 Domain Records.
It creates an *A* record which points to your Istio ingress gateway.

**Issuer**: An Issuer is a Kubernetes custom resource used to manage SSL/TLS certificates for secure communication over HTTPS. It allows you to automate the issuance and renewal of certificates. In the context of custom domain usage, the Issuer is configured to use Let's Encrypt to automatically obtain SSL/TLS certificates.

**Certificate**: The Certificate resource is used to configure and manage SSL/TLS certificates for your custom domain. It references the Issuer to automatically obtain and renew certificates for secure communication.

**Gateway**: In the context of Kyma Runtime and Istio, the Gateway is a Kubernetes custom resource responsible for handling incoming traffic and routing it to the appropriate services based on the specified hosts and ports. It plays a crucial role in enabling external access to your applications using custom domain names.

## 4. Configuration of Custom Domain in Your Kyma Runtime 

### 4.1. Quick Start 

If you want to jump directly and deploy your custom domain, you can directly use the [custom-domain chart](./chart/) chart to deploy on your cluster. 

As you can see [here](./chart/values.yaml), the values.yaml file looks like below.

```sh
# Default values for custom-domain.
# This is a YAML-formatted file.

# Enter here your AWS Access Key ID which you use to connect your AWS account 
aws_access_key_id : abc123 
# Enter here AWS Secret Access Key which you use to connect your AWS Account 
aws_secret_access_key: abc123 
# Optional, Enter here AWS Session Token if your AWS Account is requiring this value to connect
aws_session_token:  abc123  

customDomain:
  # Required - the domain you would like to use in your Kyma Cluster
  # Example - "kyma.mydomain.com" -> DO NOT GIVE Wildcards, it will be handled automatically for you
  domain: kyma.mydomain.com 
  # Optional, Default is 600s, this is the cache invalidation interval for your DNS Entry
  ttl:  
  # IP of your Istio Ingress Gateway Service which you can get via following command: 
  # kubectl get services istio-ingressgateway -n istio-system -o json | jq ".status.loadBalancer.ingress[].hostname"
  istioGatewayServiceIP: "<someIP>" 
 
issuer: 
  email: john.doe@example.org
```

Let us take a look at the parameters one-by-one.

- **aws_access_key_id**: This is the access key id you use to connect your AWS Account. 
- **aws_secret_access_key**: This is secret access key you use to connect your AWS Account
- **aws_session_token**: This value is the session token you use to connect your AWS Account.

- **customDomain**: This is the object you would use to pass your custom domain parameters. 
    - **customDomain.domain**: This is the base domain you want to use. For instance if you already own the domain *example.com*, you could give here *kyma.example.com*. Then under the hood, this helm chart will create *.kyma.example.com automatically.
    - **ttl**: This is an optional parameter. This is the value for DNS Propogation. Default value is 600 seconds.
    - **istioGatewayServiceIP**: This parameter is required, to map your DNS Entry on your Route53, to your Kyma Cluster. You can get it via the command *kubectl get services istio-ingressgateway -n istio-system -o json | jq ".status.loadBalancer.ingress[].hostname*

- **issuer**: This is the object we pass the parameters about the certificate issuer.
   - **issuer.email**: This is required by the Lets Encrypt Certificate Authority

Please set your desired values as describe.

To install the Helm chart, follow these steps:

1. Customize the values.yaml values as shown in previous section.

2. Use the following command to install the Helm chart from your root directory:

```sh
helm install cdomain ./docu/4-expert/-Kyma-/custom-domain/chart -n default --wait 
```

3. Check if everything went well with commands below. All the objects should be in ready state.

```sh
# To check if DNS Provider is ready
kubectl get dnsproviders cdomain-susaas-dns-provider -n default -o jsonpath="{.metadata.name}{.status.state}"
```
```sh
# To check if DNS Entry is ready
kubectl get dnsentry cdomain-susaas-dns-entry -n default -o jsonpath="{.metadata.name}{.status.state}"
```
```sh
# To check if Issuer is ready
kubectl get issuer cdomain-susaas-cert-issuer -n default -o jsonpath="{.metadata.name}{.status.state}"
```
```sh
# To check if Certificate is ready
kubectl get issuer cdomain-susaas-aws-letsencrypt-certificate -n istio-system -o jsonpath="{.metadata.name}{.status.state}"
```

```sh
# To check if Gateway is ready
kubectl get certificate cdomain-susaas-aws-letsencrypt-certificate -n istio-system -o jsonpath="{.metadata.name}{.status.state}"
```

If everything is ready, you can go ahead and expose your services via using your *cdomain-gateway*.

If you want to clean-up all the resources created run the command below.

```sh
helm uninstall cdomain -n default
```

### 4.2. Manual Step-By-Step Configuration

This guide will walk you through the step-by-step process of installing the resources required for enabling custom domain usage in SAP BTP Kyma Runtime. 

Before proceeding, ensure that you have the kubectl command-line tool set up and access to the Kubernetes cluster.

#### 4.2.1. Create Secret

Run the command below with replacing the placeholders with your values.

```sh
kubectl apply -n default -f  - <<EOF
kind: Secret
apiVersion: v1
metadata:
  name: cdomain-susaas-aws-creds
  labels:
    app.kubernetes.io/name: cdomain-susaas-aws-creds
stringData:
  AWS_ACCESS_KEY_ID: <your_access_key_id> #comment
  AWS_SECRET_ACCESS_KEY: <your_access_key_secret>
  AWS_SESSION_TOKEN: <your_aws_session_token> 
type: Opaque
EOF
```

#### 4.2.2. Create DNS Provider 

Run the command below with replacing the placeholders with your values.

The example given below assumes that you are the owner of **example.com**. So please put the values as shown below, base domain and wildcard domain you want to use.

```sh
kubectl apply -n default -f - <<EOF
apiVersion: dns.gardener.cloud/v1alpha1
kind: DNSProvider
metadata:
  annotations:
    dns.gardener.cloud/class: garden
    helm.sh/weight: "1"
  name: cdomain-susaas-dns-provider
spec:
  domains:
    include:
      -  kyma.example.com  
      - *.kyma.example.com 
  secretRef:
    name: cdomain-susaas-aws-creds
    namespace: susaas
  type: aws-route53
EOF
```

#### 4.2.3 Create DNS Entry 
In this step, we will create a DNSEntry resource to configure the DNS entry for the wildcard domain. 

Before you run the command below to get your Load Balancer Service IP for your Istio Ingress Gateway, you need to give the value as a target.

```sh
kubectl get services istio-ingressgateway -n istio-system -o json | jq ".status.loadBalancer.ingress[].hostname
```

Before applying the YAML, make sure to replace <"*.kyma.example.com"> with your wildcard domain, and <yourgateway.ip> from the command before.

```sh
kubectl apply -n default -f - <<EOF
apiVersion: dns.gardener.cloud/v1alpha1
kind: DNSEntry
metadata:
  annotations:
    dns.gardener.cloud/class: garden
    helm.sh/weight: "2"
  name: cdomain-susaas-dns-entry 
spec:
  dnsName: <"*.kyma.example.com">
  targets:
    - <yourgateway.ip>
  ttl: 600
EOF

```

> *Hint*: After this step, you can check your AWS Account Route 53 Service. You should see new DNS Records in your Hosted Zone.

#### 4.2.4. Create Issuer 

In this step, we will create an Issuer resource responsible for managing SSL/TLS certificates using Let's Encrypt. 

Run command below to create an issuer object on your Kyma Cluster. Replace <"kyma.example.com"> with your base domain and also replace <*.kyma.example.com> with your wildcard domain. Also replace <info@example.com> with a mail your organization has access to.

```sh
kubectl apply -n default -f - <<EOF
apiVersion: cert.gardener.cloud/v1alpha1
kind: Issuer
metadata:
  annotations:
    helm.sh/weight: "3"
  name: cdomain-susaas-cert-issuer
  namespace: susaas
spec:
  acme:
    autoRegistration: true
    domains:
      include:
        - <"kyma.example.com">
        - <"*.kyma.example.com">
    email: <info@example.com>
    server: https://acme-v02.api.letsencrypt.org/directory
EOF

```


#### 4.2.5. Create Certificate 
In this step, we will create a Certificate resource to manage the SSL/TLS certificate for your custom domain. 

Before applying the YAML, make sure to replace <kyma.example.com> with your base domain and <*.kyma.example.com> with your wildcard domain. Please notice that you are applying the certificate to the istio-system namespace. That is a known issue from Istio.

```sh
kubectl apply -n istio-system -f - <<EOF
apiVersion: cert.gardener.cloud/v1alpha1
kind: Certificate
metadata:
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "1"
  name: cdomain-susaas-aws-letsencrypt-certificate
spec:
  commonName:  <kyma.example.com>
  dnsNames:
    - <"*.kyma.example.com">
  issuerRef:
     name: cdomain-susaas-cert-issuer
     namespace: susaas
  secretRef:
    name: cdomain-susaas-aws-letsencrypt-certificate-secret
    namespace: istio-system
EOF
```

#### 4.2.6 Create Istio Gateway for Custom Domain

In this step, we will create a Gateway resource to handle the incoming traffic and route it to the appropriate services based on the specified hosts. Before applying the YAML, make sure to replace <*.kyma.example.com> with your wildcard domain.


```sh
kubectl apply -n istio-system -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  generation: 1
  name: cdomain-gateway
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "2"
spec:
  selector:
    istio: ingressgateway
  servers:
    - hosts:
        - <"*.kyma.example.com">
      port:
        name: https
        number: 443
        protocol: HTTPS
      tls:
        credentialName: cdomain-susaas-aws-letsencrypt-certificate-secret
        mode: SIMPLE
    - hosts:
        - <"*.kyma.example.com">
      port:
        name: http
        number: 80
        protocol: HTTP
      tls:
        httpsRedirect: true
EOF
```

### 4.3. Expose Your SusaaS Application with your Custom Domain

Go to your [sustainable-saas chart values-private.yaml](../../../../deploy/kyma/charts/sustainable-saas/values-private.yaml), and modify it as shown below. You need to change the **global.gateway** value to **default/cdomain-gateway**. Second thing you need to change is the domain value. You need to set your domain to **kyma.example.com** as shown below.

```sh

global:
  imagePullSecret: {}
  domain: kyma.example.com  
  shootName: a1b2c3 
  gateway: default/cdomain-gateway 

```

Last but not least, also provide a new redirect URL as part of the **xsuaa** OAuth2 Configuration, which is also part of your existing **values-private.yaml** file. 

```sh
...

xsuaa:
  parameters:
   oauth2-configuration:
    redirect-uris:
      # Provide domain here with the wildcard and "https://" prefix as shown
      - https://*.kyma.example.com/**  
      - https://*.a1b2c3.kyma.ondemand.com/**
      - http://*.localhost:5000/**
      - http://localhost:5000/**
```

If you have done the changes, last step is upgrading the helm release so that you application uses the new domain and gateway you created.

On your root directory, run the command below: 

```sh
## Run in root directory #
helm upgrade susaas deploy/kyma/charts/sustainable-saas -f deploy/kyma/charts/sustainable-saas/values-private.yaml -n default 
```

Now you can go ahead and [subscribe](../../../2-basic/4-subscribe-consumer-subaccount/README.md), you should see that your application is using your new domain.

> Hint: If you have already existing tenants and you want to update their URL's with the new ones using which includes your custom domain, you should go to the Subscription Management Dashboard 
> and update your tenants. Please check this [official documentation](https://help.sap.com/docs/btp/sap-business-technology-platform/using-subscription-management-dashboard) for guidance.

