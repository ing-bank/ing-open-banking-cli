const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { read, client } = require('./io');
const { doDigest, sign } = require('./crypto');
const { getToken, getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, keyId, tlsCertificateFile, tlsKeyFile, signingCertificateFile, signingKeyFile } =
  getConfig(root, true);
const clientId = keyId.split(':').join('=');

const signKey = read(join(root, signingKeyFile));
const signingCertificate = read(join(root, signingCertificateFile)).split('\r\n').join('');

console.log(signingCertificate);

const url = '/oauth2/token';
const method = 'post';

const date = new Date().toUTCString();
const data = 'grant_type=client_credentials';

const digest = doDigest(data);

const signing = `(request-target): ${method} ${url}\ndate: ${date}\ndigest: ${digest}`;
const signature = sign(signing, signKey);
const authorization = `Signature keyId="${clientId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`;

const httpsAgent = client(root)(tlsCertificateFile, tlsKeyFile);

const proxy = false;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  Digest: digest,
  Date: date,
  'TPP-Signature-Certificate': signingCertificate,
  'User-Agent': 'openbanking-cli/1.0.0 javascript',
  Authorization: authorization,
};

const requestAppToken = () =>
  axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .then(getToken)
    .catch(console.error);

module.exports = { requestAppToken };
