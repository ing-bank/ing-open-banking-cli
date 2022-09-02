const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { client } = require('./io');
const { getToken, getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, keyId, tlsCertificateFile, tlsKeyFile } = getConfig(root);

const url = '/oauth2/token';
const method = 'post';

const date = new Date().toUTCString();
const data = `grant_type=client_credentials&client_id=${keyId}`;

const httpsAgent = client(root)(tlsCertificateFile, tlsKeyFile);

const proxy = false;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'openbanking-cli/1.0.0 javascript',
  Date: date,
};

const requestAppToken = () =>
  axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .then(getToken)
    .catch(console.error);

module.exports = { requestAppToken };
