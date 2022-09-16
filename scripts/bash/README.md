# ING Open Banking CLI (Bash)
Here you can find the bash scripts to test your connection with the ING sandbox for Open Banking
APIs.

## Dependencies:
* bash (Git Bash for Windows users)
* curl
* openssl

## Quick Start (bash)
* Change directory: `cd scripts/bash`
* Run `./call_premium.sh` to test your connection to ING Premium APIs
* Run either `./call_psd2_auth_url.sh`  or `./call_psd2_account_info.sh`
  to test your connection to ING PSD2 APIs

## Slightly Slower Start
The scripts provided under 'Quick Start' are a composition of scripts that describe the
individual steps necessary to connect to ING Open Banking APIs. They are built in such
a way that you can pipe the result from one script in to the next as shown by the quick
start scripts. The steps are for:

### Open Banking Premium APIs:
Configuration: `apps/sandbox/config-premium.env`
1. Request an application token: `./premium_01_RequestApplicationToken.sh`
1. Call Payment Request API with the token: `./premium_02_CallPaymentRequestRegistration.sh`

#### mTLS(Mutual TLS) Only
Certain premium api's can be called using mTLS only, excluding the signature header.
1. Request an application token `./premium_01_RequestApplicationToken_mtls_only.sh`
2. Call the Showcase API `./production_01_Showcase_jws.sh`
or
1. Run `./call_premium_mtls_only.sh`

#### JWS(JSON Web Signature)
Certain premium api's can be called using JWS.
1. Request an application token `./premium_01_RequestApplicationToken_mtls_only.sh`
2. Call the Showcase API `./production_01_Showcase_mtls_only.sh`
or
1. Run `./call_production_jws.sh`

### Open Banking PSD2 APIs:
Configuration: `apps/sandbox/config-psd2.env`
1. Request an application token: `./psd2_01A_RequestApplicationToken.sh`
2. Request an authorization URL: `./psd2_02_RequestAuthorizationURL.sh`
   (the authorization URL subsequently needs additional parameters according to
   [instructions](https://developer.ing.com/openbanking/get-started/psd2) on the ING Developer Portal)

Then with an authorization code, and a (cached or new) application token, you can
request a customer token:
1. Request an application token: `./psd2_01A_RequestApplicationToken.sh`
2. Request a customer token: `./psd2_01B_RequestCustomerToken.sh`
3. Call the Account Information API: `./psd2_03_CallAccountInformationAccount.sh`
