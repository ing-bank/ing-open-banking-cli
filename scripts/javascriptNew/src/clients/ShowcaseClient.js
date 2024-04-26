import { Authenticator } from '../auth/Authenticator.js';
import { digest, readFile, signCavage } from '../util/util.js';
import path from 'node:path';
import axios, { AxiosHeaders } from 'axios';
import { HttpsAgent } from '../core/HttpsAgent.js';

export class ShowcaseClient {

  /**
   *
   * @param configuration {Configuration}
   */
  constructor(configuration) {
    this.configuration = configuration;
    this.authenticator = new Authenticator(this.configuration);
    this.rootDir = path.join(import.meta.dirname, '../../../../');

    this.axios = axios.create({
      baseURL: configuration.baseURL,
      httpsAgent: new HttpsAgent(configuration.tlsCertificateFile, configuration.tlsKeyFile).agent
    })
  }

  /**
   * @param accessToken {string}
   * @returns {Promise<any | void>}
   */
  async callSingleGreetings(accessToken) {
    const url = '/greetings/single'
    const method = 'get';
    const date = new Date().toUTCString();
    const digestString = "SHA-256=" + digest("sha256", '')
    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = signCavage(method, url, date, digestString, signingKey)

    const headers = new AxiosHeaders({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Digest": digestString,
      "Date": date,
      "User-Agent": "open-banking-cli/1.0.0 javascript",
      "Signature": `keyId="${this.configuration.keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`,
      "Authorization": `Bearer ${accessToken}`
    })

    return this.axios.get(url,{headers})
      .then(response => {
        return {headers: response.headers, body: response.data}
      })
      .catch(console.error)
  }

  /**
   * @param accessToken {string}
   * @returns {Promise<any | void>}
   */
  async callMtlsOnly(accessToken) {
    const url = '/mtls-only/greetings'
    const method = 'get';
    const date = new Date().toUTCString();
    const digestString = "SHA-256=" + digest("sha256", '')
    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = signCavage(method, url, date, digestString, signingKey)

    const headers = new AxiosHeaders({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Digest": digestString,
      "Date": date,
      "User-Agent": "open-banking-cli/1.0.0 javascript",
      "Authorization": `Bearer ${accessToken}`
    })

    return this.axios.get(url,{headers})
      .then(response => {
        return {headers: response.headers, body: response.data}
      })
      .catch(console.error)
  }
}