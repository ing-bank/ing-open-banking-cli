#!/bin/bash

################################################################################
#                             REQUEST APPLICATION ACCESS TOKEN                 #
################################################################################
# This script requests application access token for the PSD2 APIs in the ING's #
# sandbox environment using example eIDAS certificates.                        #
################################################################################

outputFile=psd2_01_accesstoken.txt

# read from config and set variables
# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"                                                  # path to root of the repository
  . $rootPath"apps/active.env"                                         # read what environment is active
  activePath=$rootPath"apps/$active"                                   # store active path
  config="$activePath/config-psd2.env"                                 # config file for sandbox app
  . "$config"                                                          # source config from fil
  keyId=$(echo "$keyId" | tr : =)                                      # map keyId from config and replace : by =
  httpHost=$baseURL                                                    # map host
  signingCertificate=$(tr -d '\r\n' <$rootPath"$signingCertificateFile") # get signing certificate from file and strip all newline characters
  signingKeyPath=$rootPath$signingKeyFile                              # map signing private key file
  tlsCertificatePath=$rootPath$tlsCertificateFile                      # map tls certificate file
  tlsKeyPath=$rootPath$tlsKeyFile                                      # map tls private key file
}

# httpMethod value must be in lower case
httpMethod="post"
reqPath="/oauth2/token"

# You can also provide scope parameter in the body E.g. "grant_type=client_credentials&scope=greetings%3Aview"
# scope is an optional parameter. If you don't provide a scope, the accessToken is returned for all available scopes
payload="grant_type=client_credentials"
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

# signingString must be declared exactly as shown below in separate lines
signingString="(request-target): $httpMethod $reqPath
date: $reqDate
digest: $digest"

signature=$(echo -n "$signingString" | openssl dgst -sha256 -sign "$signingKeyPath" -passin "pass:changeit" | openssl base64 -A)

# Curl request method must be in uppercase e.g "POST", "GET"
response=$(curl -X POST "${httpHost}${reqPath}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Digest: ${digest}" \
  -H "Date: ${reqDate}" \
  -H "TPP-Signature-Certificate: $signingCertificate" \
  -H "Authorization: Signature keyId=\"$keyId\",algorithm=\"rsa-sha256\",headers=\"(request-target) date digest\",signature=\"$signature\"" \
  --user-agent "openbanking-cli/1.0.0 bash" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath")

echo $response
export access_token=`echo $response | jq -r '.access_token'`
echo $access_token>$outputFile
