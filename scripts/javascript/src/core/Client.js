import { Authenticator } from '../auth/Authenticator.js';
import path from 'node:path';
import axios from 'axios';
import { HttpsAgent } from './HttpsAgent.js';

export class Client {

  /**
   * @param configuration {Configuration}
   */
  constructor(configuration) {
    this.configuration = configuration;
    this.authenticator = new Authenticator(this.configuration);
    this.rootDir = path.join(import.meta.dirname, '../../../../');

    this.axios = axios.create({
      baseURL: configuration.baseURL,
      httpsAgent: new HttpsAgent(configuration.tlsCertificateFile, configuration.tlsKeyFile).agent,
    });
  }
}