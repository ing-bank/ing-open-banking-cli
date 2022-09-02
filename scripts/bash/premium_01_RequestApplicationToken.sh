#!/bin/bash

###############################################################################
#                             REQUEST APPLICATION ACCESS TOKEN                #
###############################################################################
# This script requests application access token for the Premium API in-  #
# -the ING's sandbox environment using example certificates.                  #
###############################################################################

outputFile=premium_01_RequestApplicationTokenResponse.json

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

httpMethod="post" # httpMethod value must be in lower case
reqPath="/oauth2/token"

# CALCULATE DIGEST
# You can also provide scope parameter in the body E.g. "grant_type=client_credentials&scope=greetings%3Aview"
# scope is an optional parameter. The downloaded certificate contains all available scopes. If you don't provide a
# scope, the accessToken is returned for all scopes available in certificate
payload="grant_type=client_credentials"
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

# CALCULATE DATE
reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

# signingString must be declared exactly as shown below in separate lines
signingString="(request-target): $httpMethod $reqPath
date: $reqDate
digest: $digest"

signature=$(echo -n "$signingString" | openssl dgst -sha256 -sign "$signingKeyPath" | openssl base64 -A)

# Curl request method must be in uppercase e.g "POST", "GET"
curl -X POST "${httpHost}${reqPath}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Digest: ${digest}" \
  -H "Date: ${reqDate}" \
  -H "Authorization: Signature keyId=\"$keyId\",algorithm=\"rsa-sha256\",headers=\"(request-target) date digest\",signature=\"$signature\"" \
  --user-agent "openbanking-cli/1.0.0 bash" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile
