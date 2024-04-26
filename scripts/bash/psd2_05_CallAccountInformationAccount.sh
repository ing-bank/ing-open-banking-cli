#!/bin/bash

###################################################################################
#                             CALL AIS ACCOUNTS 					                        #
###################################################################################
# This script calls the AIS API in sandbox and performs a post request to the-    #
# endpoint "v3/accounts" for account details. You must request customer access-   #
# token to call this script.                                                      #
# Please update the variables "accessToken" and "certPath".   					          #
###################################################################################

outputFile=psd2_05_CallAccountInformationApiAccountResponse.json

# read from config and set variables
# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"                             # path to root of the repository
  . $rootPath"apps/active.env"                    # read what environment is active
  activePath=$rootPath"apps/$active"              # store active path
  config="$activePath/config-psd2.env"            # config file for sandbox app
  . "$config"                                     # source config from fil
  httpHost=$baseURL                               # map host
  signingKeyPath=$rootPath$signingKeyFile         # map signing private key file
  tlsCertificatePath=$rootPath$tlsCertificateFile # map tls certificate file
  tlsKeyPath=$rootPath$tlsKeyFile                 # map tls private key file
}

keyId="5ca1ab1e-c0ca-c01a-cafe-154deadbea75" # client_id as provided in the documentation

# httpMethod value must be in lower case
httpMethod="get"
reqPath="/v3/accounts"

# Digest value for an empty body
digest="SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="

# Generated value of the customer access token. Please note that the customer access token expires in 15 minutes
caccessToken=$(cat psd2_04_customer_access_token.txt)

reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

# signingString must be declared exactly as shown below in separate lines
signingString="(request-target): $httpMethod $reqPath
date: $reqDate
digest: $digest"

# signingString must be declared exactly as shown below in separate lines
signature=$(echo -n "$signingString" | openssl dgst -sha256 -sign "$signingKeyPath" | openssl base64 -A)

# Curl request method must be in uppercase e.g "POST", "GET"
curl -X GET "${httpHost}$reqPath" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Digest: ${digest}" \
  -H "Date: ${reqDate}" \
  -H "Authorization: Bearer ${caccessToken}" \
  -H "Signature: keyId=\"$keyId\",algorithm=\"rsa-sha256\",headers=\"(request-target) date digest\",signature=\"$signature\"" \
  -H "X-Request-ID: 00000000-0000-0000-0000-0000000000" \
  --user-agent "openbanking-cli/1.0.0 bash" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile
