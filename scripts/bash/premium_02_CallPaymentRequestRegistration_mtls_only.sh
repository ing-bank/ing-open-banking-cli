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

outputFile=premium_02_CallPaymentRequestRegistrationResponse__mtls_only.json

# read from config and set variables
# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"                             # path to root of the repository
  . $rootPath"apps/active.env"                    # read what environment is active
  activePath=$rootPath"apps/$active"              # store active path
  config="$activePath/config-premium.env"                 # config file for sandbox app
  . "$config"                                     # source config from fil
  httpHost=$baseURL                               # map host
  tlsCertificatePath=$rootPath$tlsCertificateFile # map tls certificate file
  tlsKeyPath=$rootPath$tlsKeyFile                 # map tls private key file
}

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

# CALCULATE DATE
reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

# Curl request method must be in uppercase e.g "POST", "GET"
curl -X POST "${httpHost}${reqPath}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Date: ${reqDate}" \
  -H "Authorization: Bearer ${accessToken}" \
  --user-agent "openbanking-cli/1.0.0 bash" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile
