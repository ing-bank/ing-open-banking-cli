import { digest, readFile, signCavage, signJWS } from '../util/util.js';
import path from 'node:path';
import { AxiosHeaders } from 'axios';
import { Client } from '../core/Client.js';

export class ShowcaseClient extends Client {

  /**
   *
   * @param configuration {Configuration}
   */
  constructor(configuration) {
    super(configuration)
  }

  /**
   * @param accessToken {string}
   * @returns {Promise<any | void>}
   */
  async callSingleGreetings(accessToken) {
    const url = '/greetings/single';
    const method = 'get';
    const date = new Date().toUTCString();
    const digestString = 'SHA-256=' + digest('sha256', '');
    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = signCavage(method, url, date, digestString, signingKey);

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Digest': digestString,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Signature': `keyId="${this.configuration.keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`,
      'Authorization': `Bearer ${accessToken}`,
    });

    return this.axios.get(url, { headers })
      .then(response => {
        return { headers: response.headers, body: response.data };
      })
      .catch(console.error);
  }

  /**
   * @param accessToken {string}
   * @returns {Promise<any | void>}
   */
  async callMtlsOnlyGreetings(accessToken) {
    const url = '/mtls-only/greetings';
    const date = new Date().toUTCString();
    const digestString = 'SHA-256=' + digest('sha256', '');

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Digest': digestString,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': `Bearer ${accessToken}`,
    });

    return this.axios.get(url, { headers })
      .then(response => {
        return { headers: response.headers, body: response.data };
      })
      .catch(console.error);
  }

  /**
   * @param accessToken {string}
   * @returns {Promise<any | void>}
   */
  async callJwsGreetings(accessToken) {
    const url = '/signed/greetings';
    const method = 'get';
    const date = new Date()
    const digestString = 'SHA-256=' + digest('sha256', '');
    const signingCertificate = readFile(path.join(this.rootDir, this.configuration.signingCertificateFile));
    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = await signJWS(method, url, date, digestString, signingCertificate, signingKey);

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Digest': digestString,
      'Date': date.toUTCString(),
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'X-JWS-Signature': signature,
      'Authorization': `Bearer ${accessToken}`,
    });

    return this.axios.get(url, { headers })
      .then(response => {
        return { headers: response.headers, body: response.data };
      })
      .catch(console.error);
  }
}