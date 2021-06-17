const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { read, client } = require('./io');
const { doDigest, sign } = require('./crypto');
const { getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, keyId, tlsCertificateFile, tlsKeyFile, signingKeyFile } = getConfig(root);

const signKey = read(join(root, signingKeyFile));

const url = '/payment-requests/registrations';
const method = 'post';

const date = new Date().toUTCString();
const data = `{
  "merchantId": "001234567",
  "merchantSubId": "123456",
  "merchantName": "Company BV",
  "merchantIBAN": "NL26INGB0003275339",
  "dailyReceivableLimit": {
    "value": 50000.00,
    "currency": "EUR"
  },
  "allowIngAppPayments": "Y"
}`;

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
  Signature: `keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`,
};

const callPRR = access_token => {
  headers.Authorization = `Bearer ${access_token}`;

  return axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .catch(console.error);
};

module.exports = { callPRR };
