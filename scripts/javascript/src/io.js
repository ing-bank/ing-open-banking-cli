const fs = require('fs');
const https = require('https');
const { join } = require('path');

/**
 * @param {string} path
 * @param {string} appendedPath
 * @return {string}
 **/
const read = (path, appendedPath = '') => fs.readFileSync(join(path, appendedPath), 'utf-8');

/**
 * @param {string} s
 * @return {string}
 **/
const write = s => {
  process.stdout.write(`${s}\n`);
  return s;
};

const client = rootPath => (certificatePath, keyPath) => {
  const cert = read(rootPath, certificatePath);
  const key = read(rootPath, keyPath);
  return new https.Agent({ cert, key });
};

module.exports = {
  client,
  read,
  write,
};
