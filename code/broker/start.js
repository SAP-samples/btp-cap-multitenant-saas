// Custom start.js file used to dynamically read broker user and password from environment variables
// Only required for Kyma scenario - In Cloud Foundry  the credentials are injected in the mtaext file

import Broker from '@sap/sbf';

// If this is a CI CD deployment we get broker credentials from env and hardcode the catalog.
 if (process.env.VCAP_APPLICATION && process.env.NODE_ENV === "production" && process.env.cicd !== true) {
    new Broker().start();
} else {
    // In production Kyma scenarios, local testing and CI CD, BROKER_USER and BROKER_PASSWORD are passed in env variables
    let brokerConfig = { brokerCredentials: { [process.env["BROKER_USER"]]: process.env["BROKER_PASSWORD"] } }
    new Broker(brokerConfig).start()
}