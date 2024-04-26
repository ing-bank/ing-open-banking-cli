import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

/**
 * @param algorithm {string}
 * @param data {string}
 * @returns {string}
 */
function digest(algorithm, data) {
  return crypto.createHash(algorithm).update(data).digest('base64')
}

/**
 * @param algorithm {string}
 * @param data {string}
 * @param signingKey {string}
 * @returns {string}
 */
function sign(algorithm, data, signingKey) {
  return crypto.createSign(algorithm).update(data).sign(signingKey, 'base64')
}

/**
 *
 * @param method {string}
 * @param url {string}
 * @param date {Date}
 * @param digest {string}
 * @param signingKey {string}
 *
 * @returns {string}
 */
function signCavage(method, url, date, digest, signingKey) {
  const signingString = `(request-target): ${method} ${url}\ndate: ${date}\ndigest: ${digest}`;
  return sign('sha256', signingString, signingKey);
}

/**
 * @param filePath {string}
 * @returns {string}
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

/**
 *
 * @param message {string}
 * @returns {string}
 */
function writeConsole(message) {
  process.stdout.write(`${message}\n`);
  return message;
}

function stringify(object) {
  return JSON.stringify(object, null, 2)
}

export { digest, sign, signCavage, readFile, writeConsole, stringify };