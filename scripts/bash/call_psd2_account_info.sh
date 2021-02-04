#!/bin/bash

./psd2_01A_RequestApplicationToken.sh | ./extractToken.sh | ./psd2_01B_RequestCustomerToken.sh | ./extractToken.sh | ./psd2_03_CallAccountInformationAccount.sh
