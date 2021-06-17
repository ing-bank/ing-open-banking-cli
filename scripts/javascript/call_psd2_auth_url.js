const { write } = require('./src/io');
const { stringify } = require('./src/utils');
const { callPsd2a } = require('./src/2a_psd2');

callPsd2a().then(stringify).then(write);
