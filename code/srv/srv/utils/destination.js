const fetch = require('node-fetch');
const xsenv = require('@sap/xsenv');
const TokenUtils = require('./token-helper.js');
const cds = require('@sap/cds');
let ds = new Object();
const Logger = cds.log('destination');

if (cds.env.profiles.find(p => p.includes("hybrid") || p.includes("production"))) {
    ds = xsenv.getServices({ ds: { tag: 'destination' } }).ds;
}

async function createDestination(subdomain, destinationConfig) {
    try {
        let tokenEndpoint = createTokenEndpoint(subdomain);
        let token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, ds.clientid, ds.clientsecret);
        let response = await fetch(ds.uri + '/destination-configuration/v1/subaccountDestinations', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(destinationConfig)
        });

        if (!response.ok) {
            throw new Error(`Failed to create destination: ${response.statusText}`);
        }

        let destination = await response.json();
        Logger.log("Destination successfully created.");
        return destination;
    } catch (error) {
        Logger.error("Error: Destination can not be created.");
        Logger.error(`Error: ${error.message}`);
        throw error;
    }
}

async function deleteDestination(subdomain, name) {
    try {
        let nameEnc = encodeURIComponent(name);
        let tokenEndpoint = createTokenEndpoint(subdomain);
        let token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, ds.clientid, ds.clientsecret);
        let response = await fetch(ds.uri + `/destination-configuration/v1/subaccountDestinations/${nameEnc}`, {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete destination: ${response.statusText}`);
        }

        Logger.log("Destination successfully deleted.");
        return response;
    } catch (error) {
        Logger.error("Error: Destination can not be deleted.");
        Logger.error(`Error: ${error.message}`);
        throw error;
    }
}

async function getDestination(subdomain, name) {
    try {
        let nameEnc = encodeURIComponent(name);
        let tokenEndpoint = createTokenEndpoint(subdomain);
        let token = await TokenUtils.getTokenWithClientCreds(tokenEndpoint, ds.clientid, ds.clientsecret);
        let response = await fetch(ds.uri + `/destination-configuration/v1/subaccountDestinations/${nameEnc}`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to retrieve destination: ${response.statusText}`);
        }

        let data = await response.json();
        Logger.log("Destination successfully retrieved.");
        return data;
    } catch (error) {
        Logger.error("Error: Destination can not be retrieved.");
        Logger.error(`Error: ${error.message}`);
    }
}

function createTokenEndpoint(subdomain) {
    let url = ds.url + '/oauth/token?grant_type=client_credentials';
    return url.replace(/(^https:\/\/)([^.]+)(\..+$)/, '$1' + subdomain + '$3');
}

module.exports = { createDestination, deleteDestination, getDestination };
