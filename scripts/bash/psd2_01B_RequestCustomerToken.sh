#!/bin/bash

###################################################################################
#                             REQUEST CUSTOMER ACCESS TOKEN                       #
###################################################################################
# This script requests customer access token based on authorization code using-   #
# the endpoint "oauth2/token". You must request an application access token to 	  #
# run this script. Please update the variables "accessToken", "certPath" and      #
# "authorization_code"                                                            #
###################################################################################

outputFile=psd2_01B_RequestCustomerTokenResponse.json

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

keyId="5ca1ab1e-c0ca-c01a-cafe-154deadbea75"              # client_id as provided in the documentation
authorization_code="8b6cd77a-aa44-4527-ab08-a58d70cca286" # generated value of authorization code from the previous step.

# Generated value of application access token. Please note that the access token expires in 15 minutes
read -r accessToken

# AUTHORIZATION CODE MUST BE PROVIDED AS A VALUE TO THE "code" PARAMETER IN THE PAYLOAD.
payload="grant_type=authorization_code&code=$authorization_code"
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

# httpMethod value must be in lower case
httpMethod="post"
reqPath="/oauth2/token"

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
  -H "Authorization: Bearer ${accessToken}" \
  -H "Signature: keyId=\"$keyId\",algorithm=\"rsa-sha256\",headers=\"(request-target) date digest\",signature=\"$signature\"" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile
