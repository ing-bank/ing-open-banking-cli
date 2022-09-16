const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { read, client } = require('./io');
const { doDigest, sign } = require('./crypto');
const { getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, tlsCertificateFile, tlsKeyFile, signingKeyFile } = getConfig(root);

const signKey = read(join(root, signingKeyFile));

const url = '/mtls-only/greetings';
const method = 'get';

const date = new Date().toUTCString();
const data = ``;

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
  'User-Agent': 'openbanking-cli/1.0.0 javascript',
};

const callShowcaseMtlsOnly = access_token => {
  headers.Authorization = `Bearer ${access_token}`;

  return axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .catch(console.error);
};

module.exports = { callShowcaseMtlsOnly };
