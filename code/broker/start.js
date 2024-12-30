// Custom start.js file used to dynamically read broker user and password from environment variables
// Only required for Kyma scenario - In Cloud Foundry  the credentials are injected in the mtaext file

import Broker from '@sap/sbf';

// If this is a CI CD deployment we get broker credentials from env and hardcode the catalog.
if (process.env.cicd) {
    const catalog = `{
                    "services": [
                        {
                        "name": "susaas-api",
                        "description": "Sustainable SaaS API",
                        "bindable": true,
                        "plans": [
                            {
                            "name": "trial",
                            "description": "Trial Plan",
                            "id": "8f7c2dce-7500-4115-9df5-aebb9060e83d"
                            },
                            {
                            "name": "default",
                            "description": "Standard Plan",
                            "id": "d1d6bcc4-5f75-43cb-a537-3fddbff00f11"
                            },
                            {
                            "name": "premium",
                            "description": "Premium Plan",
                            "id": "2e12d1f4-d871-443c-8824-6f33d2748a1b"
                            }
                        ],
                        "id": "ba609874-a1da-4f9c-a22b-f61de0c71a9e"
                        }
                    ]
                }`             
    delete process.env.SBF_BROKER_CREDENTIALS_HASH;
    let brokerConfig = { brokerCredentials: { [process.env["BROKER_USER"]]: process.env["BROKER_PASSWORD"] }, catalog: JSON.parse(catalog) }
    new Broker(brokerConfig).start()
}
// If VCAP_APPLICATION is defined, we are in a Cloud Foundry scenario
// For local testing, the USER and PASSWORD are always injected via environment variables
else if (process.env.VCAP_APPLICATION && process.env.NODE_ENV === "production" && process.env.cicd !== true) {
    new Broker().start();
} else {
    // In production Kyma scenarios and local testing, BROKER_USER and BROKER_PASSWORD are passed in env variables
    let brokerConfig = { brokerCredentials: { [process.env["BROKER_USER"]]: process.env["BROKER_PASSWORD"] } }
    new Broker(brokerConfig).start()
}