#!/bin/bash

./psd2_01_RequestApplicationToken.sh && ./psd2_02_RequestAuthorizationURL.sh | ./extractUrl.sh
