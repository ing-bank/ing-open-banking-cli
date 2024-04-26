import { Client } from '../core/Client.js';
import { digest, readFile, signCavage } from '../util/util.js';
import path from 'node:path';
import axios, { AxiosHeaders } from 'axios';

export class PaymentRequestRegistrationClient extends Client {

  /**
   * @param configuration {Configuration}
   */
  constructor(configuration) {
    super(configuration);
  }

  /**
   *  Registers a new client, returning a certificate to be used by it.
   * @param accessToken {string}
   * @param mtlsOnly {boolean}
   * @returns {Promise<any|void>}
   */
  async callRegistrations(accessToken, mtlsOnly = false) {
    const url = '/payment-requests/registrations'
    const method = 'post'
    const date = new Date().toUTCString();
    const data = `{
      "merchantId": "001234567",
      "merchantSubId": "123456",
      "merchantName": "Company BV",
      "merchantIBAN": "NL26INGB0003275339",
      "dailyReceivableLimit": {
        "value": 50000.00,
        "currency": "EUR"
      },
      "allowIngAppPayments": "Y"
    }`;
    const digestString = 'SHA-256=' + digest('sha256', data);
    const signingKey = readFile(path.join(this.rootDir, this.configuration.signingKeyFile));
    const signature = signCavage(method, url, date, digestString, signingKey);

    const headers = new AxiosHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Date': date,
      'User-Agent': 'open-banking-cli/1.0.0 javascript',
      'Authorization': `Bearer ${accessToken}`,
    })

    if(!mtlsOnly) {
      headers.set('Digest', digestString)
      headers.set('Signature', `keyId="${this.configuration.keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`)
    }

    return this.axios.post(url,data, {headers})
      .then(response => response.data)
      .catch(console.error);
  }
}