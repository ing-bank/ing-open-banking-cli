const { write } = require('./src/io');
const { callPremium } = require('./src/1_premium');
const { stringify } = require('./src/utils');
const { callPremiumShowcase } = require('./src/1_premium_showcase');

callPremium().then(write);
callPremiumShowcase().then(stringify).then(write);
