const jose = require('node-jose');  // Decrypting with JOSE
const xsenv = require('@sap/xsenv');
const credStore = xsenv.getServices({ credStore: { tag: 'credstore' } }).credStore;

async function readCredential(namespace, type, name) {
    return fetchAndDecrypt(
        credStore.encryption.client_private_key,
        `${credStore.url}/${type}?name=${encodeURIComponent(name)}`,
        "GET",
        headers(credStore, namespace)
    );
}

async function getCredentialValue(namespace, type, name) {
    return fetchAndDecryptValue(
        credStore.encryption.client_private_key,
        `${credStore.url}/${type}?name=${encodeURIComponent(name)}`,
        "get",
        headers(credStore, namespace)
    );
}

async function decryptPayload(privateKey, payload) {
    const { JWE, JWK } = jose;
    const key = await JWK.asKey(
        `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`, 
        'pem', 
        {alg: "RSA-OAEP-256", enc: "A256GCM"}
    );
    const decrypt = await JWE.createDecrypt(key).decrypt(payload);
    return decrypt.plaintext.toString();
}

async function fetchAndDecrypt(privateKey, url, method, headers, body) {
    const result = await fetch(url, { method, headers, body })
        .then(checkStatus)
        .then(response => response.text())
        .then(payload => decryptPayload(privateKey, payload))
        .then(JSON.parse);
    return result;
}

async function fetchAndDecryptValue(privateKey, url, method, headers, body) {
    const result = await fetch(url, { method, headers, body })
        .then(checkStatus)
        .then(response => response.text())
        .then(payload => decryptPayload(privateKey, payload))
        .then(JSON.parse);
    return result.value;
}

function checkStatus(response) {
    if (!response.ok) {
        throw Error('checkStatus: ' + response.status + ' ' + response.statusText);
    }
    return response;
}

function headers(credStore, namespace) {

    return {
        'Authorization': `Basic ${Buffer.from(`${credStore.username}:${credStore.password}`).toString('base64')}`,
        'sapcp-credstore-namespace':namespace
    }
}

module.exports = { readCredential, getCredentialValue };
