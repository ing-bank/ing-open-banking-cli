const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { read, client } = require('./io');
const { doDigest, sign } = require('./crypto');
const { getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, tlsCertificateFile, tlsKeyFile, signingKeyFile } = getConfig(root, true);

const signKey = read(join(root, signingKeyFile));

const url = '/v3/accounts';
const method = 'get';

const date = new Date().toUTCString();
const data = '';

const digest = doDigest(data);

const signing = `(request-target): ${method} ${url}\ndate: ${date}\ndigest: ${digest}`;
const signature = sign(signing, signKey);

const httpsAgent = client(root)(tlsCertificateFile, tlsKeyFile);

const proxy = false;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Digest: digest,
  Date: date,
};

const callAIA = (customer_token, client_id) => {
  headers.Authorization = `Bearer ${customer_token}`;
  headers.Signature = `keyId="${client_id}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`;

  return axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .catch(console.error);
};

module.exports = { callAIA };
