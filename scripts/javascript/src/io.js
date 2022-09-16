const fs = require('fs');
const { Agent } = require('better-https-proxy-agent');
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
  const ca = read(rootPath, 'apps/sandbox/certificates/cafile.pem');

  const httpsAgentOptions = {
    rejectUnauthorized: false,
    cert,
    key,
    ca,
  };

  const proxyRequestOptions = {
    protocol: 'http:',
    host: 'localhost',
    port: 3128,
    cert: read(rootPath, certificatePath),
    key: read(rootPath, keyPath),
    ca: read(rootPath, 'apps/sandbox/certificates/cafile.pem'),
  };
  return new Agent(httpsAgentOptions, proxyRequestOptions);
};

module.exports = {
  client,
  read,
  write,
};
