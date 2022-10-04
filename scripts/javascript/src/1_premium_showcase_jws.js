const { requestAppToken } = require('./premium_01_RequestApplicationToken_mtls_only');
const { callShowcaseJws } = require('./premium_02_Showcase_jws.js');

const callPremiumShowcase = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callShowcaseJws);

module.exports = { callPremiumShowcase };
