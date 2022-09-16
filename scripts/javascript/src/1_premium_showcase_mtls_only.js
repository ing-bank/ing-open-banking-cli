const { requestAppToken } = require('./premium_01_RequestApplicationToken_mtls_only');
const { callShowcaseMtlsOnly } = require('./premium_02_Showcase_mtls_only.js');

const callPremiumShowcase = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callShowcaseMtlsOnly);

module.exports = { callPremiumShowcase };
