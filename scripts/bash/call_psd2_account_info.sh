#!/bin/bash

./psd2_01_RequestApplicationToken.sh &&
./psd2_02_RequestAuthorizationURL.sh &&
./psd2_03_RequestAuthorizationCode.sh &&
./psd2_04_RequestCustomerToken.sh &&
./psd2_05_CallAccountInformationAccount.sh