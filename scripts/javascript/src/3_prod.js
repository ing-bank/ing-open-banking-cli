const { requestAppToken } = require('./premium_01_RequestApplicationToken');
const { callShowcase } = require('./production_01_Showcase');

const callProd = () =>
  requestAppToken()
    .then(({ access_token }) => access_token)
    .then(callShowcase);

module.exports = { callProd };
