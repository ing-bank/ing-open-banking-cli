#!/bin/bash

###############################################################################
#                   CALL PAYMENT REQUEST AND REGISTER A MERCHANT              #
###############################################################################
# This script calls the payment request API in ING's sandbox environment and- #
# -submits a post request to the endpoint "payment-requests/registrations".   #
# You must request an application access token to run this script.            #
# Please update the variables "accessToken", "certPath". You can find the-    #
# other endpoints to test in the sandbox under "sandbox" section of the API-  #
# documentation                                                               #
###############################################################################

outputFile=premium_02_CallPaymentRequestRegistrationResponse.json

# read from config and set variables
# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"                             # path to root of the repository
  . $rootPath"apps/active.env"                    # read what environment is active
  activePath=$rootPath"apps/$active"              # store active path
  config="$activePath/config-premium.env"                 # config file for sandbox app
  . "$config"                                     # source config from fil
  keyId=$keyId                                    # map keyId from config
  httpHost=$baseURL                               # map host
  signingKeyPath=$rootPath$signingKeyFile         # map signing private key file
  tlsCertificatePath=$rootPath$tlsCertificateFile # map tls certificate file
  tlsKeyPath=$rootPath$tlsKeyFile                 # map tls private key file
}

# httpMethod value must be in lower code
httpMethod="post"
reqPath="/payment-requests/registrations"

# Generated value of application access token from the previous step. Please note that the access token expires in 15 minutes
read -r accessToken

# Body content as provided under "Sandbox" section of the documentation for "Payment Request API".
# This content is for testing the API response and should not be edited.
payload='{
  "merchantId": "001234567",
  "merchantSubId": "123456",
  "merchantName": "Company BV",
  "merchantIBAN": "NL26INGB0003275339",
  "dailyReceivableLimit": {
    "value": 50000.00,
    "currency": "EUR"
  },
  "allowIngAppPayments": "Y"
}'
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

# CALCULATE DATE
reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

# signingString must be declared exactly as shown below in separate lines
signingString="(request-target): $httpMethod $reqPath
date: $reqDate
digest: $digest"

signature=$(echo -n "$signingString" | openssl dgst -sha256 -sign "$signingKeyPath" -passin "pass:changeit" | openssl base64 -A)

# Curl request method must be in uppercase e.g "POST", "GET"
curl -X POST "${httpHost}${reqPath}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Digest: ${digest}" \
  -H "Date: ${reqDate}" \
  -H "Authorization: Bearer ${accessToken}" \
  -H "Signature: keyId=\"$keyId\",algorithm=\"rsa-sha256\",headers=\"(request-target) date digest\",signature=\"$signature\"" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile
