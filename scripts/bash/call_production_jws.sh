#!/bin/bash

./premium_01_RequestApplicationToken_mtls_only.sh | ./extractToken.sh | ./production_01_Showcase_jws.sh
