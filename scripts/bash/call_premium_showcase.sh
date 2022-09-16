#!/bin/bash

./premium_01_RequestApplicationToken.sh | ./extractToken.sh | ./premium_01_Showcase.sh
