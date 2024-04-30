#!/bin/bash

./premium_01_RequestApplicationToken_mtls_only.sh | ./extractToken.sh | ./premium_02_CallPaymentRequestRegistration_mtls_only.sh
