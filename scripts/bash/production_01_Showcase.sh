#!/bin/bash

outputFile=production_01_Showcase.json

# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"
  . $rootPath"apps/active.env"
  activePath=$rootPath"apps/$active"
  config="$activePath/config-premium.env"
  . "$config"
  keyId=$keyId
  httpHost=$baseURL
  signingKeyPath=$rootPath$signingKeyFile
  tlsCertificatePath=$rootPath$tlsCertificateFile
  tlsKeyPath=$rootPath$tlsKeyFile
}

httpMethod="get"
reqPath="/greetings/single"

read -r accessToken

payload=''
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

signingString="(request-target): $httpMethod $reqPath
date: $reqDate
digest: $digest"

signature=$(echo -n "$signingString" | openssl dgst -sha256 -sign "$signingKeyPath" -passin "pass:changeit" | openssl base64 -A)

curl -X GET "${httpHost}${reqPath}" \
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

