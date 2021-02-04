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

module.exports = {
  doDigest,
  sign,
};
