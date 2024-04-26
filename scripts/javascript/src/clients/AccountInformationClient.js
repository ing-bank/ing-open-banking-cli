import { Client } from '../core/Client.js';
import { digest, readFile, signCavage } from '../util/util.js';
import path from 'node:path';
import axios, { AxiosHeaders } from 'axios';

export class AccountInformationClient extends Client{

  /**
   *
   * @param configuration {Configuration}
   */
  constructor(configuration) {
    super(configuration);
  }

  async callGetAccounts(customerAccessToken, clientId) {
    const url = "/v3/accounts"
    const method = 'get';
    const date = new Date().toUTCString();
    const digestString = `SHA-256=${digest('sha256', '')}`

    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile))
    const signature = signCavage(method, url, date, digestString, signingKey)

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Digest': digestString,
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': `Bearer ${customerAccessToken}`,
      'Signature': `keyId="${clientId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`
    })

    return this.axios.get(url, {headers})
      .then(result => result.data)
      .catch(console.error)
  }
}