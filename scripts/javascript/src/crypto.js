const crypto = require('crypto');

/**
 * @param {string} data
 * @return {string}
 */
const doDigest = data => `SHA-256=${crypto.createHash('sha256').update(data).digest('base64')}`;

/**
 * @param {string} signing
 * @param {string} signKey
 * @return {string}
 */
const sign = (signing, signKey) =>
  crypto.createSign('sha256').update(signing).sign(signKey, 'base64');

/**
 * @param {string} signCert
 * @return {string}
 */
const getFingerprint = signCert =>
  Buffer.from(new crypto.X509Certificate(signCert).fingerprint256.replace(/:/g, ''), 'hex')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\n/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

module.exports = {
  doDigest,
  sign,
  getFingerprint,
};
