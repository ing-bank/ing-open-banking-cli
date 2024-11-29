import { configDotenv } from 'dotenv';
import * as path from 'node:path';

export class Configuration {

  /**
   *
   * @param appDir {string} A directory in the 'apps' directory
   * @param isPSD2 {boolean} Dictates if the configuration should use PSD2 or Premium certificates
   */
  constructor(appDir, isPSD2) {
    this.appDir = appDir;
    this.isPSD2 = isPSD2;

    const parsedConfiguration = configDotenv({
      path: `${path.join(import.meta.dirname, '../../../../')}apps/${this.appDir}/config-${this.isPSD2 ? 'psd2' : 'premium'}.env`
    }).parsed;
    this.baseURL = parsedConfiguration.baseURL;
    this.authorizationBaseURL = parsedConfiguration.authorizationBaseURL;
    this.keyId = parsedConfiguration.keyId;
    this.tlsCertificateFile = parsedConfiguration.tlsCertificateFile;
    this.tlsKeyFile = parsedConfiguration.tlsKeyFile;
    this.signingCertificateFile = parsedConfiguration.signingCertificateFile;
    this.signingKeyFile = parsedConfiguration.signingKeyFile;
  }


}