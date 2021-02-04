const { write } = require('./src/io');
const { stringify } = require('./src/utils');
const { callPsd2b } = require('./src/2b_psd2');

callPsd2b().then(stringify).then(write);
