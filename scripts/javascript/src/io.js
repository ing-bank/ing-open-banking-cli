const fs = require('fs');
const { Agent } = require('better-https-proxy-agent');
const { join } = require('path');
const https = require('https');

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

  // When using a proxy
  // proxy = {
  //   host: 'localhost',
  //   port: 3128
  // };

  const proxy = null;
  if (proxy) {
    const httpsAgentOptions = {
      rejectUnauthorized: false,
      cert,
      key,
    };

    const proxyRequestOptions = {
      protocol: 'http:',
      host: proxy.host,
      port: proxy.port,
      cert: cert,
      key: key,
    };
    return new Agent(httpsAgentOptions, proxyRequestOptions);
  }
  return new https.Agent({ cert, key });
};

module.exports = {
  client,
  read,
  write,
};
