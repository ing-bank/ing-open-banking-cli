const { write } = require('./src/io');
const { callOB } = require('./src/1_ob');

callOB().then(write);
