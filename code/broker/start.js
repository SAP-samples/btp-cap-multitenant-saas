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
                "name": "default",
                "description": "Standard Plan",
                "id": "57030d69-3e2d-4dd9-a138-21f16b542dff"
              }
            ],
            "id": "6dec18a5-4742-450f-8840-ef9df0331b20"
          }
        ]
      }`
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