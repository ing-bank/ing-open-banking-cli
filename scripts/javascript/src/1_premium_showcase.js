const { requestAppToken } = require('./premium_01_RequestApplicationToken_mtls_only');
const { callShowcase } = require('./premium_02_Showcase.js');

const callPremiumShowcase = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callShowcase);

module.exports = { callPremiumShowcase };
