const { write } = require('./src/io');
const { callPsd2a } = require('./src/2a_psd2');

callPsd2a().then(write);
