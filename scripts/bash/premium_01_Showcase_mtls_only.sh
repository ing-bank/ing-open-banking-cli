#!/bin/bash

outputFile=premium_01_Showcase_mtls_only.json

# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"
  . $rootPath"apps/active.env"
  activePath=$rootPath"apps/$active"
  config="$activePath/config-premium.env"
  . "$config"
  keyId=$keyId
  httpHost=$baseURL
  tlsCertificatePath=$rootPath$tlsCertificateFile
  tlsKeyPath=$rootPath$tlsKeyFile
}

reqPath="/mtls-only/greetings"

read -r accessToken

payload=''
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")

curl -X GET "${httpHost}${reqPath}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Digest: ${digest}" \
  -H "Date: ${reqDate}" \
  -H "Authorization: Bearer ${accessToken}" \
  --user-agent "openbanking-cli" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile

