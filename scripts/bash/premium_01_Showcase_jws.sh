#!/bin/bash

outputFile=premium_01_Showcase.json

# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"
  source $rootPath"apps/active.env"
  activePath=$rootPath"apps/$active"
  config="$activePath/config-premium.env"
  source "$config"
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

# generate sigT date (REQUIREMENT-19)
sigT=`date -u +"%Y-%m-%dT%H:%M:%SZ"`

base64Fingerprint=$(openssl x509 -noout -fingerprint -sha256 -inform pem -in "$signingCertificatePath"   | cut -d'=' -f2 | sed s/://g  | xxd -r -p | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

jwsHeader='{"b64":false,"x5t#S256":"'$base64Fingerprint'","crit":[ "sigT", "sigD", "b64"],"sigT":"'"$sigT"'","sigD":{ "pars":[ "(request-target)", "content-type",  "digest" ], "mId":"http://uri.etsi.org/19182/HttpHeaders"},"alg":"PS256"}'

jwsHeaderBase64URL=`echo -n "$jwsHeader" | openssl base64 -e -A | tr -d '=' | tr '/+' '_-' | tr -d '\n'`

# signingString must be declared exactly as shown below in separate lines
signingString="(request-target): $httpMethod $reqPath
content-type: application/x-www-form-urlencoded
digest: $digest"

## Step 4: Prepare input for Signature Value Computation
# Description: Combine Base64url encoded JWS Protected Header with HTTP Header to be signed, separated by ".", ready for computation of signature value.
inputForSignatureValueComputation="$jwsHeaderBase64URL.$signingString"

## Step 5: Compute JWS Signature Value
# Description: Compute the digital signature cryptographic value calculated over a sequence of octets derived from the JWS Protected Header and HTTP Header Data to be Signed.
# This is created using the signing key associated with the certificate identified in the JWS Protected Header "x5t#S256" and using the signature algorithm identified by "alg".
jwsSignatureValue=$(printf %s "$inputForSignatureValueComputation"| openssl dgst -sha256 -sign $signingKeyPath -sigopt rsa_padding_mode:pss | openssl base64 -A  | tr -d '=' | tr '/+' '_-' | tr -d '\n')

jwsSignature=$jwsHeaderBase64URL..$jwsSignatureValue

curl -i -X GET "${httpHost}${reqPath}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Digest: ${digest}" \
  -H "Authorization: Bearer ${accessToken}" \
  -H "X-JWS-Signature: ${jwsSignature}" \
  -d "${payload}" \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath">$outputFile

echo -e "The response to your request is:"
received_payload=$(cat $outputFile | awk '/^\r?$/{p=1; next} p' | sed 's/\r$//')
echo $received_payload

# Utility function for converting Base64URL to Base64.
base64url_to_base64() {
  # read from stdin
  local input;  read -r input;
  # Replace URL-safe characters
  input=$(echo "$input" | tr '_-' '/+' | sed 's/,/\n/g' | sed 's/\r//')

  # Pad with = if needed
  inputLength=${#input}
  local mod=$((inputLength % 4))
  if [[ "$mod" -eq 2 ]]; then
      input="${input}=="
  elif [[ "$mod" -eq 3 ]]; then
      input="${input}="
  fi
  echo "$input"
}

echo "###############################################################################"
echo "# Validating JWS Signature and signing certificate trust chain..              #"
echo "###############################################################################"

received_digest=$(cat $outputFile | sed -n 's/digest: //p' | sed 's/\r$//')

calculated_digest='SHA-256='$(echo -n "$received_payload" | openssl dgst -binary -sha256 | openssl base64)
if [[ "$calculated_digest" == "$received_digest" ]]; then
  echo "--------------- 1) Digest validation passed ---------------"
else
  echo "--------------- 1) Error: Digest validation failed ---------------"
fi

jws_signature=$(cat $outputFile | sed -n 's/x-jws-signature: //p')
jws_protected_header=$(echo -n "$jws_signature" | cut -d'.' -f1)

# Step 3: Decode JWS Protected Header
#Description: Decoded JWS Protected header.
#Note: this step is added here just to follow the Annex example steps, it is only for visual verification.
jws_protected_header_decoded=$(echo -n "$jws_protected_header" | base64url_to_base64 | base64 -d)
echo Decoded JWS Protected Header: "$jws_protected_header_decoded"

# Step 4: Recreate HTTP Header that was signed
# Description: Recreate HTTP Header for the fields identified in the JWS header sigD.
# Note: these headers might differ, based on API specification (but the defaults are content-type and digest)

# extract the 'pars' field from the JWS Protected Headers' 'sigD' field.
pars=$(echo -n "$jws_protected_header" | base64url_to_base64 | base64 -d | jq -c '.sigD.pars')
if [[ "$pars" != '["content-type","digest"]' ]]; then
  echo "Error: Unexpected pars value. Expected [\"content-type\",\"digest\"] Got: $pars"
fi

#construct the http headers part
#Note: for compatibility between operating systems, the headers are constructed into a file
httpHeaders="content-type: $(cat "$outputFile" | sed -n 's/Content-Type: //p'),digest: $(cat "$outputFile" | sed -n 's/digest: //p')"
echo -n "$httpHeaders" | sed 's/,/\n/g' | sed 's/\r//' > httpHeaders.txt

# Step 5: Recreate input for Signature Value
#Description: Combine Base64url encoded JWS Protected Header with HTTP Header to be signed ready
input_for_signature_verification=$jws_protected_header.$(cat httpHeaders.txt)

# needed by OpenSSL - write input (for signature verification) to a file; has to be already sha-256, as this is the way openssl expects it
echo -n "$input_for_signature_verification" | openssl dgst -binary -sha256 > input_for_signature_verification.bin

# Step 6: Cryptographically Validate Signature Value
#Description: Extract JWS signature value from x-jws-signature after "'.." and validated against recreated
#JWS protected Header and HTTP Header with the certificate identified in the JWS Protected Header
#"x5c" and using the signature algorithm identified by "alg".
x5c_certificate=$(echo "$jws_protected_header" | base64url_to_base64 | base64 -d | jq -c '.x5c[0]' | tr -d '"')
received_certificate_pem="-----BEGIN CERTIFICATE-----\n$x5c_certificate\n-----END CERTIFICATE-----\n"
public_key=$(echo -e "$received_certificate_pem" | openssl x509 -pubkey -noout)

# needed by OpenSSL - write public key to file
echo -n "$public_key" > public_key.pem
# needed by OpenSSL - write signature to file
echo -n "$jws_signature" | cut -d'.' -f3 | base64url_to_base64 | base64 -d > jws_signature.bin

# actual verification of the signature
signature_verification_result=$(openssl pkeyutl -verify -pubin -inkey public_key.pem \
                                        -pkeyopt digest:sha256 \
                                        -pkeyopt rsa_padding_mode:pss \
                                        -pkeyopt rsa_pss_saltlen:32 \
                                        -sigfile jws_signature.bin \
                                        -in input_for_signature_verification.bin)
if [[ "$signature_verification_result" == "Signature Verified Successfully" ]]; then
  echo "--------------- 2) Signature validation passed ---------------"
else
  echo "--------------- 2) Error: Signature validation failed ---------------"
fi

# Step 7: Validation of Certificate Chain
#Description: This step is doing the trust chain validation, where we certify that the received certificate is signed by a known CA.

#download root CA
if test -f rootg4.cer; then
  echo "INFO: rootg4.cer already exists and will not be downloaded again."
else
  curl https://pki.ing.net/g4/binary_certificates/g4_c2r_bin.cer --output rootg4.cer
fi

if test -f cag4.cer; then
  echo "INFO: cag4.cer already exists and will not be downloaded again."
else
  curl https://pki.ing.net/g4/binary_certificates/g4_c2r_ca02_bin.cer --output cag4.cer
fi

if test -f customerg4.cer; then
  echo "INFO: customerg4.cer already exists and will not be downloaded again."
else
  curl https://pki.ing.net/g4/binary_certificates/g4_c2r_ca02_cus_bin.cer --output customerg4.cer
fi

# Convert rootg4.cer, cag4.cer and customerg4.cer to PEM (they were in DER format initially), then concatenate into the chain file,
# to be able to provide it as argument for "openssl verify -CAfile" command.
{ openssl x509 -inform der -in rootg4.cer && openssl x509 -inform der -in cag4.cer && openssl x509 -inform der -in customerg4.cer; } > chain.pem

# writing the received x5c to a file so that openssl can verify it.
echo -e "$received_certificate_pem" > received_certificate.pem

# actual verification of trust chain with openssl
trust_chain_validation_result=$(openssl verify -CAfile chain.pem received_certificate.pem)

if [[ "$trust_chain_validation_result" == *:\ OK* ]]; then
  echo "--------------- 3) Validation of trust chain passed ---------------"
else
  echo "--------------- 3) Error: Trust chain validation failed ---------------"
fi