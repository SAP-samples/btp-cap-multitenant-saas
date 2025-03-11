const cds = require('@sap/cds');
const Logger = cds.log('token-utils');

const tokenCache = new Map(); 

async function getTokenWithClientCreds(tokenEndpoint, clientid, clientsecret) {
    try {
        const cachedToken = tokenCache.get(clientid);
        if (cachedToken && cachedToken.expiry > Date.now()) {
            Logger.debug("Using cached token for clientid:", clientid);
            return cachedToken.token;
        }

        let authOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientid + ':' + clientsecret).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                response_type: 'token'
            }).toString()
        };

        let response = await fetch(tokenEndpoint, authOptions);
        if (!response.ok) {
            throw { message: `Error: ${response.statusText}` };
        }

        let data = await response.json();
        let token = data.access_token;
        let expiresIn = data.expires_in || 1200; 

        tokenCache.set(clientid, {
            token,
            expiry: Date.now() + expiresIn * 1000
        });

        Logger.debug("Token successfully retrieved and cached for clientid:", clientid);
        return token;
    } catch (error) {
        Logger.error("Error: Token can not be retrieved!");
        Logger.error(`Error: ${error.message}`);
        throw error;
    }
}

module.exports = { getTokenWithClientCreds };
