const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { read, client } = require('./io');
const { doDigest, sign } = require('./crypto');
const { getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, tlsCertificateFile, tlsKeyFile, signingKeyFile } = getConfig(root, true);

const signKey = read(join(root, signingKeyFile));

const url = '/oauth2/token';
const method = 'post';
const authorizationCode = '8b6cd77a-aa44-4527-ab08-a58d70cca286';

const date = new Date().toUTCString();
const data = `grant_type=authorization_code&code=${authorizationCode}`;

const digest = doDigest(data);

const signing = `(request-target): ${method} ${url}\ndate: ${date}\ndigest: ${digest}`;
const signature = sign(signing, signKey);

const httpsAgent = client(root)(tlsCertificateFile, tlsKeyFile);

const proxy = false;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  Digest: digest,
  Date: date,
};

const requestCustomerToken = (access_token, client_id) => {
  headers.Authorization = `Bearer ${access_token}`;
  headers.Signature = `keyId="${client_id}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`;

  return axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .then(({ access_token }) => ({ access_token, client_id }))
    .catch(console.error);
};

module.exports = { requestCustomerToken };
