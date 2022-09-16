#!/bin/bash

###############################################################################
#                             REQUEST APPLICATION ACCESS TOKEN                #
###############################################################################
# This script requests application access token for the Premium API in-  #
# -the ING's sandbox environment using example certificates.                  #
###############################################################################

outputFile=premium_01_RequestApplicationTokenResponse_mtls_only.json

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
  tlsCertificatePath=$rootPath$tlsCertificateFile # map tls certificate file
  tlsKeyPath=$rootPath$tlsKeyFile                 # map tls private key file
}

httpMethod="post" # httpMethod value must be in lower case
reqPath="/oauth2/token"

payload="grant_type=client_credentials&client_id=${keyId}"

# CALCULATE DATE
reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")


# Curl request method must be in uppercase e.g "POST", "GET"
curl -X POST "${httpHost}${reqPath}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Date: ${reqDate}" \
  --user-agent "openbanking-cli/1.0.0 bash" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile