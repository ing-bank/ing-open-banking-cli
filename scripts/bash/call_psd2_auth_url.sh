#!/bin/bash

./psd2_01A_RequestApplicationToken.sh | ./extractToken.sh | ./psd2_02_RequestAuthorizationURL.sh | ./extractUrl.sh
