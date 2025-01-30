# ING Open Banking CLI (Node.js)

Here you can find the node.js scripts to test your connection with the ING sandbox for Open Banking APIs.

## Dependencies

* node.js (tested on v20.11.1)

## Quick Start (bash)

* Change directory: `cd scripts/javascript`
* Run `npm i` to install the runtime dependencies
* Run `node call_showcase_single.js` to test your connection to ING OAuth 2.0 API

## Other scripts

- For connecting to Showcase API we provide three scripts:
  - `call_showcase_single` which uses the old Cavage signature
  - `call_showcase_mtls` which uses mutual TLS authentication
  - `call_showcase_jws` which uses the new JWS signature when making the request
- `call_payment_registration` which registers a new merchant for Payment Request Registration API, another premium API from ING
- `call_account_information_api` which goes through the flow of retrieving account data for a customer. This is a PSD2 API.

## Configuration:

Inside the `apps/` directory you create your own configuration and use your own certificates.
Use the configuration files provided in the `apps/sandbox/` directory as an example, all parameters are mandatory.

For premium configurations, the `keyId` parameter is the `clientID` of the application created in the
[Developer Portal](https://developer.ing.com). For PSD2 configurations the `keyId` is the **SN** field
of the signing certificate.

To use your own configuration, in the scripts mentioned above, when declaring the
`Configuration` object just pass the name of your own directory and specify whether you
want to use the PSD2 configuration or not.

Example

```javascript
// uses the premium configuration from 'myOwnDirectory'
const configuration = new Configuration("myOwnDirectory", false)

// uses the psd2 configuration from 'myOwnDirectory'
const configuration = new Configuration("myOwnDirectory", true)
```

## Caveats

Does not work behind a proxy
