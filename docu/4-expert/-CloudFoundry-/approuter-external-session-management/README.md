# Implementing External Session Management with Redis for SAP BTP Multitenant Applications using @sap/approuter

## Introduction
The `@sap/approuter` npm module serves as the entry point for multitenant applications on the SAP Business Technology Platform (BTP). As a necessary component for multitenant applications, `@sap/approuter` functions as an OAuth2 client and handles session management. By default, it stores sessions in memory, which can result in session loss after application restarts, a behavior that can be especially frustrating. This documentation outlines how to implement external session management with Redis to overcome this limitation, ensuring seamless session persistence and enhancing scalability.

## Why External Session Management with Redis?
When deploying applications in the SAP BTP Cloud Foundry environment, application instances may restart due to updates, scaling, or maintenance activities. This can lead to session loss because sessions are stored in memory in @sap/approuter by default. Utilizing external session management with Redis solves this problem with following:

- **Session Persistence:** Redis enables external storage of session data, preventing session loss even during application restarts.
  
- **Horizontal Scalability:** Session persistenca allows @sap/approuter to be horizontally scalable.

## Prerequisites
Before proceeding with the implementation, ensure you have the following prerequisites:

- A multitenant application deployed on SAP BTP Cloud Foundry Runtime.
- Redis Hyperscaler Option entitlement is added.

## Implementation Steps

### 1. Create a Redis Instance
Using the Cloud Foundry Command Line Interface (CF CLI), create a Redis service instance. Replace `<instance-name>` with your preferred name for the Redis instance:

```sh
cf create-service redis-cache free <instance-name>
```

### 2. Configure Redis options on your @sap/approuter
Using the Cloud Foundry Command Line Interface (CF CLI), set environment of your approuter. Replace `<instance-name>` with your preferred name for the Redis instance and
 replace `<session-secret>` with your preferred secret. This secret will be used to generate a session cookie. Please generate a unique string with at least 64 characters.
Please see [npm documentation](https://www.npmjs.com/package/@sap/approuter) for the details of the parameters.

```sh
cf set-env <your-approuter> EXT_SESSION_MGT '{
                        "instanceName": "<instance-name>",
                        "storageType": "redis",
                        "sessionSecret": "<session-secret>",
                        "defaultRetryTimeout": 10000,
                        "backOffMultiplier": 10
                        }'
```

### 3. Create Service Binding
Bind the newly created Redis instance to your @sap/approuter application:

```sh
cf bind-service <your-approuter> <instance-name>
```
After setting the environment variable and binding, you need to restage your application for the changes to take effect.

```sh
cf restage <your-approuter>
```

## 4. Test
After doing this steps, you can test the changes with following.
 - Open your multitenant application
 - Restart your approuter while the application is open and wait until it is up again.
 - Once your approuter is up and running, continue working on the app.

You will be able to work on your application since your sessions are stored in Redis, not in memory anymore. 

