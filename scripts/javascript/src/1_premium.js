const { requestAppToken } = require('./premium_01_RequestApplicationToken');
const { callPRR } = require('./premium_02_CallPaymentRequestRegistration');

const callPremium = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callPRR);

module.exports = { callPremium };
