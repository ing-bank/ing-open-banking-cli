import * as https from 'node:https';
import { readFile } from '../util/util.js';
import path from 'node:path';

export class HttpsAgent {

  /**
   * @param certificateFile {string}
   * @param keyFile {string}
   */
  constructor(certificateFile, keyFile) {
    this.rootDir = this.rootDir = path.join(import.meta.dirname, '../../../../');

    const tlsCertificate = readFile(path.join(this.rootDir, certificateFile));
    const tlsKey = readFile(path.join(this.rootDir, keyFile));

    this.agent = new https.Agent({cert: tlsCertificate, key: tlsKey})
  }
}