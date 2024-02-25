
import axios from 'axios';
import cds from '@sap/cds'
const Logger = cds.log('token-utils')
class TokenUtils {

    static async getTokenWithClientCreds(tokenEndpoint, clientid, clientsecret) {
        try {
            let authOptions = {
                method: 'POST',
                url: tokenEndpoint,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'Basic ' + Buffer.from(clientid + ':' + clientsecret).toString('base64')
                },
                data: new URLSearchParams({
                    grant_type: 'client_credentials',
                    response_type: 'token'
                }).toString()
            };
            let response = await axios(authOptions);
            let token = response.data.access_token;
            Logger.debug
            ("Token successfully retrieved!")
            return token;
        } catch (error) {
            Logger.error("Error: Token can not be retrieved!")
            Logger.error(`Error: ${error.message}`)
            throw error;
        }
    }
}

export default TokenUtils