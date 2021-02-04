#!/bin/bash

./openBanking_01_RequestApplicationToken.sh | ./extractToken.sh | ./openBanking_02_CallPaymentRequestRegistration.sh
