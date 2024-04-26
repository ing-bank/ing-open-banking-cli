import { Configuration } from './src/configuration/Configuration.js';
import { Authenticator } from './src/auth/Authenticator.js';
import { stringify, writeConsole } from './src/util/util.js';
import { ShowcaseClient } from './src/clients/ShowcaseClient.js';

const configuration = new Configuration("sandbox", false)
const authenticator = new Authenticator(configuration)
const showcaseClient = new ShowcaseClient(configuration)

authenticator.requestAppToken()
  .then(token => showcaseClient.callSingleGreetings(token))
  .then(response => writeConsole(stringify(response)))