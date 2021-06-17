const { write } = require('./src/io');
const { stringify } = require('./src/utils');
const { callPremium } = require('./src/1_premium');
const { callPsd2a } = require('./src/2a_psd2');
const { callPsd2b } = require('./src/2b_psd2');

Promise.all([callPremium(), callPsd2a(), callPsd2b()])
  .then(([a, b, c]) => ({
    call_premium: a ? '\u2713' : '\u2717',
    call_psd2_auth_url: b ? '\u2713' : '\u2717',
    call_psd2_account_info: c ? '\u2713' : '\u2717',
  }))
  .then(stringify)
  .then(write);
