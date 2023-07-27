
import fetch from 'node-fetch';
import jose from 'node-jose';
import xsenv from '@sap/xsenv';

let credStore = new Object(); 

if (cds.env.profiles.find( p =>  p.includes("hybrid") || p.includes("production"))) {
    try{
        credStore = xsenv.getServices({ credStore: { tag: 'credstore' }}).credStore;
    }catch(error){
        console.log("[cds] - Credential Store Binding is missing, therefore CAP will not interact with Credential Store Service");
    }
}

class CredStore {

    async readCredential(namespace, type, name) {
        return this.#fetchAndDecrypt(
            credStore.encryption.client_private_key,
            `${credStore.url}/${type}?name=${encodeURIComponent(name)}`, 
            "get", 
            this.#headers(credStore, namespace)
        );
    }

    async readCredentialValue(namespace, type, name) {
        return this.#fetchAndDecryptValue(
            credStore.encryption.client_private_key,
            `${credStore.url}/${type}?name=${encodeURIComponent(name)}`, 
            "get", 
            this.#headers(credStore, namespace)
        );
    }

    async #decryptPayload(privateKey, payload) {
        const { JWE, JWK } = jose;
        const key = await JWK.asKey(
            `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`, 
            'pem', 
            {alg: "RSA-OAEP-256", enc: "A256GCM"}
        );
        const decrypt = await JWE.createDecrypt(key).decrypt(payload);
        const result = decrypt.plaintext.toString();
        return result;
    }

    async #fetchAndDecrypt(privateKey, url, method, headers, body) {
        const result = await fetch(url, {method, headers, body})
            .then(this.#checkStatus)
            .then(response => response.text())
            .then(payload => this.#decryptPayload(privateKey, payload))
            .then(JSON.parse);
        return result;
    }

    async #fetchAndDecryptValue(privateKey, url, method, headers, body) {
        const result = await fetch(url, {method, headers, body})
            .then(this.#checkStatus)
            .then(response => response.text())
            .then(payload => this.#decryptPayload(privateKey, payload))
            .then(JSON.parse);
        return result.value;
    }

    #checkStatus(response) {
        if (!response.ok) {
            throw Error('checkStatus: ' + response.status + ' ' + response.statusText);
        }
        return response;
    }

    #headers(credStore, namespace, init) {
        const result = new fetch.Headers(init);
        result.set('Authorization', `Basic ${Buffer.from(`${credStore.username}:${credStore.password}`).toString('base64')}`);
        result.set('sapcp-credstore-namespace', namespace);
        return result;
    }
}

export default CredStore;