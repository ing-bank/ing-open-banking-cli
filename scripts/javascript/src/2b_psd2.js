const { requestAppToken } = require('./psd2_01A_RequestApplicationToken');
const { requestCustomerToken } = require('./psd2_01B_RequestCustomerToken');
const { callAIA } = require('./psd2_03_CallAccountInformationAccount');

const callPsd2b = () =>
  requestAppToken()
    .then(({ access_token, client_id }) => [access_token, client_id])
    .then(([token, id]) => requestCustomerToken(token, id))
    .then(({ access_token, client_id }) => [access_token, client_id])
    .then(([token, id]) => callAIA(token, id));

module.exports = { callPsd2b };
