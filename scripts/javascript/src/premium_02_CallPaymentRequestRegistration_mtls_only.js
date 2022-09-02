const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { client } = require('./io');
const { getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, tlsCertificateFile, tlsKeyFile } = getConfig(root);

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

const httpsAgent = client(root)(tlsCertificateFile, tlsKeyFile);

const proxy = false;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'openbanking-cli/1.0.0 javascript',
  Date: date,
};

const callPRR = access_token => {
  headers.Authorization = `Bearer ${access_token}`;

  return axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .catch(console.error);
};

module.exports = { callPRR };
