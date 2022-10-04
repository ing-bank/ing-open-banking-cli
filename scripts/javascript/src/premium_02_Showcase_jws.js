const axios = require('axios').default;
const { join } = require('path');
const { getConfig } = require('./config');
const { read, client } = require('./io');
const { doDigest, getFingerprint, sign } = require('./crypto');
const { getData } = require('./utils');

const root = join(__dirname, '../../../');

const { baseURL, tlsCertificateFile, tlsKeyFile, signingKeyFile, signingCertificateFile } =
  getConfig(root);

const signKey = read(join(root, signingKeyFile));
const signCert = read(join(root, signingCertificateFile));

const url = '/signed/greetings';
const method = 'get';

const date = new Date().toUTCString();
const data = ``;

const digest = doDigest(data);

const fingerprint = getFingerprint(signCert);

const jwsHeader = {
  b64: false,
  'x5t#S256': fingerprint,
  crit: ['sigT', 'sigD', 'b64'],
  sigT: new Date().toISOString().replace(/[.]\d+/, ''),
  sigD: {
    pars: ['(request-target)', 'content-type', 'digest'],
    mId: 'http://uri.etsi.org/19182/HttpHeaders',
  },
  alg: 'RS256',
};

const signing = `(request-target): get /signed/greetings\ncontent-type: application/json\ndigest: ${digest}\n`;

const jwsHeaderBase64URL = Buffer.from(JSON.stringify(jwsHeader))
  .toString('base64')
  .replace(/\=+$/, '');

const jwsSignatureValue = sign(`${jwsHeaderBase64URL}.${signing}`, signKey).replace(/\=+$/, '');

const jwsSignature = `${jwsHeaderBase64URL}..${jwsSignatureValue}`;

const httpsAgent = client(root)(tlsCertificateFile, tlsKeyFile);

const proxy = false;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Digest: digest,
  Date: date,
  'User-Agent': 'openbanking-cli/1.0.0 javascript',
  'X-JWS-Signature': jwsSignature,
};

const callShowcaseJws = access_token => {
  headers.Authorization = `Bearer ${access_token}`;

  return axios({ baseURL, url, method, data, headers, httpsAgent, proxy })
    .then(getData)
    .catch(console.error);
};

module.exports = { callShowcaseJws };
