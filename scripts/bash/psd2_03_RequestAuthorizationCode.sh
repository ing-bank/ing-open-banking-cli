#!/bin/bash

#########################################################################################
#                             REQUEST AUTHORISATION CODE                                #
#########################################################################################
# This script calls the endpoint "grantssupport/$referenceId/auth-code" (where          #
# referenceId is extracted from the url returned by psd2_02_RequestAuthorizationURL.sh  #
# script) and returns an Authorisation Code. The application access token is taken from #
# the first step. Please update the variable "certPath".                                #
 ########################################################################################

outputFile=psd2_03_RequestAuthorizationCodeResponse.json

# read from config and set variables
# shellcheck disable=SC2154,SC1090
{
  rootPath="./../../"                             # path to root of the repository
  . $rootPath"apps/active.env"                    # read what environment is active
  activePath=$rootPath"apps/$active"              # store active path
  config="$activePath/config-psd2.env"            # config file for sandbox app
  . "$config"                                     # source config from fil
  httpHost=$baseURL                               # map host
  myAccountHost=$myAccountBaseURL                 # map my account host
  signingKeyPath=$rootPath$signingKeyFile         # map signing private key file
  tlsCertificatePath=$rootPath$tlsCertificateFile # map tls certificate file
  tlsKeyPath=$rootPath$tlsKeyFile                 # map tls private key file
}

# Generated value of the application access token. Please note that the access token expires in 15 minutes
accessToken=$(cat psd2_01_accesstoken.txt)

referenceId=$(cat psd2_02_RequestAuthorizationURLResponse.json | jq -r '.location | split("/") | map(select(length > 0)) | .[-2]')

echo '###################################################################################
                             CALL GRANTSUPPORT ACCOUNTS
###################################################################################'
# Call the endpoint "/grantssupport/accounts" to simulate UI which loads a page with the available accounts.
#httpHostMyAccount="https://api.myaccount.sandbox.ing.com"

accountsResponse=$(curl -k -X GET "${myAccountHost}/grantssupport/accounts" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer ${accessToken}" )

echo "Accounts response:"
echo $accountsResponse
echo -e "\n"

echo '###################################################################################
                             SELECTING PROFILE
###################################################################################'
cleaned_accountsResponse=${accountsResponse:6}

selected_profile=$(echo "$cleaned_accountsResponse" | jq '.accounts[] | select((.name == "Popescu Corina") and
(.scopes[0] == "payment-accounts:balances:view") and (.country_code == "RO"))')
echo "$selected_profile"
echo '###################################################################################
                        CALL GRANTSSUPPORT URL TO GET AUTH_CODE
###################################################################################'

extractedId=$(echo "$selected_profile" | jq -r '.id')
extractedScopes=$(echo "$selected_profile" | jq -r '.scopes | join(" ")')

echo $tlsCertificatePath

grantsSupportResponse=$(curl -k -X POST "${myAccountHost}/grantssupport/$referenceId/auth-code" \
-H "host: api.myaccount.sandbox.ing.com" \
-H "Authorization: Bearer ${accessToken}" \
-H 'Content-Type: application/json' \
-H 'X-XSRF-Token: t7oVFHD1d4MKlzKqbqME1QrYGrdWdPtkbPoFBngMR5xlWEYaJPLk-BVvE8Up1CKV' \
-H 'Cookie: XSRF-TOKEN=t7oVFHD1d4MKlzKqbqME1QrYGrdWdPtkbPoFBngMR5xlWEYaJPLk-BVvE8Up1CKV' \
-d '{
	"id":"'"$extractedId"'",
    "client_id":"5ca1ab1e-c0ca-c01a-cafe-154deadbea75",
    "scopes":"'"$extractedScopes"'",
    "state":"ANY_ARBITRARY_VALUE",
    "redirectURL":"https://example.com"
}' \
  --cert "$tlsCertificatePath" \
  --key "$tlsKeyPath")

echo -e "\n"
echo "GrantsSupportResponse: "
echo $grantsSupportResponse
echo -e "\n"

cleaned_grantsSupportResponse=${grantsSupportResponse:6}

# get the authorization code from GrantsSupportResponse
authorization_code=$(echo "$cleaned_grantsSupportResponse" | jq -r '.location | split("=") | map(select(length > 0)) | .[-1]')

echo $authorization_code > psd2_03_RequestAuthorizationCode.txt