require('isomorphic-fetch');
const { Client } = require("@microsoft/microsoft-graph-client");
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { ClientSecretCredential } = require("@azure/identity");

const credential = new ClientSecretCredential(
    'a22bd-...-a1f071e',    // Directory (tenant) ID
    '9b79b-...-1f1c55d',    // Application (client) ID
    'ZYM8Q~...~SUscdn2'     // Application Secret
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, { scopes: ["https://graph.microsoft.com/.default"] });
const client = Client.initWithMiddleware({ debugLogging: true, authProvider });

const sendMail = {
    message: {
        subject: 'Meet for lunch?',
        body: {
            contentType: 'Text',
            content: 'The new cafeteria is open!'
        },
        toRecipients: [{
            emailAddress: { address: 'mail.address@of.recipient' }  // Recipient's e-mail address   
        }]
    },
    saveToSentItems: 'false'
};

client.api('/users/mail.address@of.mailbox/sendMail')        // Shared mailbox e-mail address
    .header("Content-type", "application/json")
    .post(sendMail, (err, res, rawResponse) => {
        console.log(res);
        console.log(rawResponse);
        console.log(err);
    });