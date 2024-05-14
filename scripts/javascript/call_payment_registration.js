import { Configuration } from './src/configuration/Configuration.js';
import { Authenticator } from './src/auth/Authenticator.js';
import { writeConsole } from './src/util/util.js';
import { PaymentRequestRegistrationClient } from './src/clients/PaymentRequestRegistrationClient.js';

const configuration = new Configuration("sandbox", false)
const authenticator = new Authenticator(configuration)
const paymentRegistrationClient = new PaymentRequestRegistrationClient(configuration)

writeConsole('\n----------- NORMAL CALL -----------\n')
await authenticator.requestAppToken()
  .then(token => paymentRegistrationClient.callRegistrations(token))
  .then(writeConsole)

writeConsole('\n\n----------- MTLS ONLY CALL -----------\n')
await authenticator.requestMtlsAppToken()
  .then(token => paymentRegistrationClient.callRegistrations(token, true))
  .then(writeConsole)