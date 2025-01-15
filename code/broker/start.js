// Custom start.js file used to dynamically read broker user and password from environment variables
// Only required for Kyma scenario - In Cloud Foundry  the credentials are injected in the mtaext file

import Broker from '@sap/sbf';

// If we are running as a CF deployment we get broker credentials and catalog from environment variables
 if (process.env.VCAP_APPLICATION && process.env.NODE_ENV === "production") {
    new Broker().start();
} else {
    // In production Kyma scenarios, local testing BROKER_USER and BROKER_PASSWORD are passed in env variables
    if(process.env.SBF_BROKER_CREDENTIALS) delete process.env.SBF_BROKER_CREDENTIALS
    if(process.env.SBF_BROKER_CREDENTIALS_HASH) delete process.env.SBF_BROKER_CREDENTIALS_HASH
    
    let brokerConfig = { brokerCredentials: { [process.env["BROKER_USER"]]: process.env["BROKER_PASSWORD"] } }
    new Broker(brokerConfig).start()
}