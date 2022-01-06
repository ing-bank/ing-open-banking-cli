const { requestAppToken } = require('./premium_01_RequestApplicationToken_mtls_only');
const { callPRR } = require('./premium_02_CallPaymentRequestRegistration_mtls_only');

const callPremium = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callPRR);

module.exports = { callPremium };
