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
  signingCertificatePath=$rootPath$signingCertificateFile
  tlsCertificatePath=$rootPath$tlsCertificateFile
  tlsKeyPath=$rootPath$tlsKeyFile
}

httpMethod="get"
reqPath="/signed/greetings"

read -r accessToken

payload=''
payloadDigest=$(echo -n "$payload" | openssl dgst -binary -sha256 | openssl base64)
digest=SHA-256=$payloadDigest

reqDate=$(LC_TIME=en_US.UTF-8 date -u "+%a, %d %b %Y %H:%M:%S GMT")
# generate sigT date (REQUIREMENT-19)
sigT=`date -u +"%Y-%m-%dT%H:%M:%SZ"`

base64Fingerprint=$(openssl x509 -noout -fingerprint -sha256 -inform pem -in $signingCertificatePath | cut -d'=' -f2 | sed s/://g  | xxd -r -p | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

jwsHeader='{"b64":false,"x5t#S256":"'$base64Fingerprint'","crit":[ "sigT", "sigD", "b64"],"sigT":"'"$sigT"'","sigD":{ "pars":[ "(request-target)", "content-type",  "digest" ], "mId":"http://uri.etsi.org/19182/HttpHeaders"},"alg":"RS256"}'

jwsHeaderBase64URL=`echo -n "$jwsHeader" | openssl base64 -e -A | tr -d '=' | tr '/+' '_-' | tr -d '\n'`

# signingString must be declared exactly as shown below in separate lines
signingString="(request-target): $httpMethod $reqPath
content-type: application/json
digest: $digest
"

# jwsSignatureValue must be declared exactly as shown below in separate lines
jwsSignatureValue=`printf %s "$jwsHeaderBase64URL.$signingString" | openssl dgst -sha256 -sign "$signingKeyPath" | openssl base64 -A  | tr -d '=' | tr '/+' '_-' | tr -d '\n'`

jwsSignature=$jwsHeaderBase64URL..$jwsSignatureValue

curl -X GET "${httpHost}${reqPath}" \
  -H "Content-Type: application/json" \
  -H "Digest: ${digest}" \
  -H "Date: ${reqDate}" \
  -H "Authorization: Bearer ${accessToken}" \
  -H "X-JWS-Signature: ${jwsSignature}" \
  --user-agent "openbanking-cli" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath" >$outputFile

cat $outputFile


