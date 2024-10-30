#!/bin/bash

read -r INPUT_JSON

temp=$(echo "$INPUT_JSON" | jq -r '.access_token')

echo "$temp"
