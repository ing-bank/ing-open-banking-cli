const { write } = require('./src/io');
const { stringify } = require('./src/utils');
const { callOB } = require('./src/1_ob');
const { callPsd2a } = require('./src/2a_psd2');
const { callPsd2b } = require('./src/2b_psd2');

Promise.all([callOB(), callPsd2a(), callPsd2b()])
  .then(([a, b, c]) => ({
    call_open_banking: a ? '\u2713' : '\u2717',
    call_psd2_auth_url: b ? '\u2713' : '\u2717',
    call_psd2_account_info: c ? '\u2713' : '\u2717',
  }))
  .then(stringify)
  .then(write);
