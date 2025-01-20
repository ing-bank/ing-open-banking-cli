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
2. Call the ShowCaseAPI with the token: `./premium_01_Showcase.sh`
or
2. Call Payment Request API with the token: `./premium_02_CallPaymentRequestRegistration.sh`
or
1. Run `./call_premium.sh` which calls both ShowCaseAPI and Payment Request API

#### mTLS(Mutual TLS) Only
Certain premium api's can be called using mTLS only, excluding the signature header.
1. Request an application token `./premium_01_RequestApplicationToken_mtls_only.sh`
2. Call the Showcase API with the token `./premium_01_Showcase_mtls_only.sh`
or
2. Call the Payment Request API with the token `./premium_02_CallPaymentRequestRegistration_mtls_only.sh`
or 
1. Run `./call_premium_mtls_only.sh` which calls both ShowCaseAPI and Payment Request API

#### JWS(JSON Web Signature)
Certain premium api's require a JWS message signature to ensure message integrity.
1. Request an application token `./premium_01_RequestApplicationToken_mtls_only.sh`
2. Call the Showcase API `./premium_01_Showcase_jws.sh`
or
1. Run `./call_premium_jws.sh`

If you want to learn more about JWS message signing and/or signature verification for the signed responses by ING, please refer to the Getting Started Guide
where the text of the Getting Started Guide links to https://developer.ing.com/openbanking/resources/get-started/premium#jws

### Open Banking PSD2 APIs:
Configuration: `apps/sandbox/config-psd2.env`
1. Request an application token: `./psd2_01_RequestApplicationToken.sh`. 
The above script outputs the access token value into a txt file which is then picked up automatically by the following scripts, 
so there is no need to pass the application access token on each request
2. Request an authorization URL: `./psd2_02_RequestAuthorizationURL.sh`
   (the authorization URL subsequently needs additional parameters according to
   [instructions](https://developer.ing.com/openbanking/get-started/psd2) on the ING Developer Portal)
3. Request authorisation code: `./psd2_03_RequestAuthorizationCode.sh`
4. Request a customer access token: `./psd2_04_RequestCustomerToken.sh`
5. Call the Account Information API: `./psd2_05_CallAccountInformationAccount.sh`
