import { digest, readFile, signCavage } from '../util/util.js';
import * as path from 'node:path';
import axios, { AxiosHeaders } from 'axios';
import { HttpsAgent } from '../core/HttpsAgent.js';

export class Authenticator {

  /**
   * @param configuration {Configuration}
   */
  constructor(configuration) {
    this.configuration = configuration;

    this.rootDir = path.join(import.meta.dirname, '../../../../');
    this.url = '/oauth2/token';
    this.method = 'post';
    this.scopes = 'grant_type=client_credentials';
    this.digest = 'SHA-256=' + digest('sha256', this.scopes);

    this.axios = axios.create({
      baseURL: this.configuration.baseURL,
      httpsAgent: new HttpsAgent(this.configuration.tlsCertificateFile, this.configuration.tlsKeyFile).agent,
    });
  }

  /**
   * @returns {Promise<string>}
   */
  async requestAppToken() {
    const date = new Date().toUTCString();

    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));

    const signature = signCavage(this.method, this.url, date, this.digest, signingKey);
    const authorization = `Signature keyId="${this.configuration.keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`;

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Digest': this.digest,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': authorization,
    });

    /** @type {Token} */
    const token = await this.axios
      .post(this.url, this.scopes, { headers })
      .then(response => {
        return response.data;
      })
      .catch(console.error);

    return token.access_token;
  }

  /**
   * @returns {Promise<string>}
   */
  async requestMtlsAppToken() {
    const date = new Date().toUTCString();
    const data = this.scopes + `&client_id=${this.configuration.keyId}`

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
    });

    /** @type {Token} */
    const token = await this.axios
      .post(this.url, data, { headers })
      .then(response => {
        return response.data;
      })
      .catch(console.error);

    return token.access_token;
  }
}