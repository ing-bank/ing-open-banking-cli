const { write } = require('./src/io');
const { callPremium } = require('./src/1_premium');

callPremium().then(write);
