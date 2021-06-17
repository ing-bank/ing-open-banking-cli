const { write } = require('./src/io');
const { stringify } = require('./src/utils');
const { callProd } = require('./src/3_prod');

callProd().then(stringify).then(write);
