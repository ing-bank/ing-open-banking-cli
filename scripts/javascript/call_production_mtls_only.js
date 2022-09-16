const { write } = require('./src/io');
const { stringify } = require('./src/utils');
const { callPremiumShowcase } = require('./src/1_premium_showcase_jws');

callPremiumShowcase().then(stringify).then(write);
