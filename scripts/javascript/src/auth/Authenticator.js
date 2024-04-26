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
   * @returns {Promise<string | {access_token: string, client_id: string}>}
   */
  async requestAppToken() {
    const date = new Date().toUTCString();

    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));

    const signature = signCavage(this.method, this.url, date, this.digest, signingKey);
    const authorization = `Signature keyId="${this.configuration.isPSD2 ? this.configuration.keyId.split(":").join("=") : this.configuration.keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`;

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Digest': this.digest,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': authorization,
    });

    if(this.configuration.isPSD2) {
      const signingCertificate = readFile(path.join(this.rootDir, this.configuration.signingCertificateFile));
      headers.set('TPP-Signature-Certificate', signingCertificate.replaceAll('\r\n', '').replaceAll('\n', ''))
    }

    /** @type {Token} */
    const token = await this.axios
      .post(this.url, this.scopes, { headers })
      .then(response => {
        return response.data;
      })
      .catch(console.error);

    if (this.configuration.isPSD2) {
      return {
        access_token: token.access_token,
        client_id: token.client_id
      }
    }

    return token.access_token;
  }

  /**
   * @param accessToken {string}
   * @param clientId {string}
   * @param authorizationCode {string}
   * @returns {Promise<void>}
   */
  async requestCustomerToken(accessToken, clientId,  authorizationCode) {
    const date = new Date().toUTCString();

    const data = `grant_type=authorization_code&code=${authorizationCode}`
    const digestString = "SHA-256=" + digest('sha256', data);

    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = signCavage(this.method, this.url, date, digestString, signingKey);

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Digest': digestString,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': `Bearer ${accessToken}`,
      'Signature': `keyId="${clientId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`
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

  /**
   * @param accessToken {string}
   * @param clientId {string}
   * @returns {Promise<string>}
   */
  async requestAuthorizationUrl(accessToken, clientId) {
    const redirectUri = "https://www.example.com"
    const scope = "payment-accounts%3Abalances%3Aview%20payment-accounts%3Atransactions%3Aview"
    const url = `/oauth2/authorization-server-url?scope=${scope}&redirect_uri=${redirectUri}&country_code=NL`
    const method = 'get'
    const date = new Date().toUTCString();
    const digestString = digest('sha256', '')

    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = signCavage(method, url, date, digestString, signingKey);

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Digest': digestString,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': `Bearer ${accessToken}`,
      'Signature': `keyId="${clientId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`
    })

    return this.axios.get(url, {headers})
      .then(response =>
        response.data.location + `?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=some-state&response_type=code`)
      .catch(console.error)
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