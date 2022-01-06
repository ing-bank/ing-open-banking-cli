const { write } = require('./src/io');
const { callPremium } = require('./src/1_premium_mtls_only');

callPremium().then(write);
