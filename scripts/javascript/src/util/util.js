import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import RSAKey from 'rsa-key';

/**
 * @param algorithm {string}
 * @param data {string}
 * @returns {string}
 */
function digest(algorithm, data) {
  return crypto.createHash(algorithm).update(data).digest('base64');
}

/**
 * @param algorithm {string}
 * @param data {string}
 * @param signingKey {string}
 * @returns {string}
 */
function sign(algorithm, data, signingKey) {
  return crypto.createSign(algorithm).update(data).sign(signingKey, 'base64');
}

/**
 *
 * @param method {string}
 * @param url {string}
 * @param date {Date}
 * @param digest {string}
 * @param signingKey {string}
 *
 * @returns {string}
 */
function signCavage(method, url, date, digest, signingKey) {
  const signingString = `(request-target): ${method} ${url}\ndate: ${date}\ndigest: ${digest}`;
  return sign('sha256', signingString, signingKey);
}

/**
 *
 * @param method {string}
 * @param url {string}
 * @param date {Date}
 * @param digest {string}
 * @param signingCertificate {string}
 * @param signingKey {string}
 * @returns {Promise<string>}
 */
async function signJWS(method, url, date, digest, signingCertificate, signingKey) {
  const rsaPkcs8Key = new RSAKey(signingKey)
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    rsaPkcs8Key.exportKey('der', 'pkcs8'),
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  )

  const fingerprint = getFingerprint(signingCertificate)

  const jwsHeader = {
    b64: false,
    'x5t#S256': fingerprint,
    crit: ['sigT', 'sigD', 'b64'],
    sigT: date.toISOString().replace(/[.]\d+/, ''),
    sigD: {
      pars: ['(request-target)', 'content-type', 'digest'], mId: 'http://uri.etsi.org/19182/HttpHeaders',
    },
    alg: 'PS256',
  };

  const jwsHeaderBase64URL = Buffer.from(JSON.stringify(jwsHeader)).toString('base64url');

  const signingString = `(request-target): ${method} ${url}\ncontent-type: application/x-www-form-urlencoded\ndigest: ${digest}`;
  const jwsSignatureValue = (await crypto.subtle.sign({
    name: 'RSA-PSS', saltLength: 32,
  }, privateKey, Buffer.from(`${jwsHeaderBase64URL}.${signingString}`)));
  const jwsSignatureValueBase64 = Buffer.from(jwsSignatureValue).toString('base64url')

  return `${jwsHeaderBase64URL}..${jwsSignatureValueBase64}`
}

/**
 * @param certificate {string}
 * @returns {string}
 */
function getFingerprint(certificate) {
  return Buffer.from(new crypto.X509Certificate(certificate).fingerprint256.replace(/:/g, ''), 'hex')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\n/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * @param filePath {string}
 * @returns {string}
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 *
 * @param message {string}
 * @returns {string}
 */
function writeConsole(message) {
  process.stdout.write(`${message}\n`);
  return message;
}

function stringify(object) {
  return JSON.stringify(object, null, 2);
}

export { digest, sign, signCavage, signJWS, readFile, writeConsole, stringify };