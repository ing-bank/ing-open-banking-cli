const { requestAppToken } = require('./openBanking_01_RequestApplicationToken');
const { callPRR } = require('./openBanking_02_CallPaymentRequestRegistration');

const callOB = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callPRR);

module.exports = { callOB };
