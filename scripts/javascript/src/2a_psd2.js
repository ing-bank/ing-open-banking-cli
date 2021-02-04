const { requestAppToken } = require('./psd2_01A_RequestApplicationToken');
const { requestAuthUrl } = require('./psd2_02_RequestAuthorizationURL');

const callPsd2a = () =>
  requestAppToken()
    .then(({ access_token, client_id }) => [access_token, client_id])
    .then(([token, id]) => requestAuthUrl(token, id))
    .then(({ location }) => location);

module.exports = { callPsd2a };
