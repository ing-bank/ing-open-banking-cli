#!/bin/bash

./premium_01_RequestApplicationToken.sh | ./extractToken.sh | ./production_01_Showcase.sh
