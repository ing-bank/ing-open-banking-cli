#!/bin/bash

./premium_01_RequestApplicationToken.sh | ./extractToken.sh | ./premium_02_CallPaymentRequestRegistration.sh
