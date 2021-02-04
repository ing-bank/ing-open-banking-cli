#!/bin/bash

read -r INPUT_JSON

IFS="," read -r -a JSON_PARTS <<<"$INPUT_JSON"
IFS=":" read -r -a ACCESS_TOKEN_LINE <<<"${JSON_PARTS[0]}"
unset IFS

temp="${ACCESS_TOKEN_LINE[1]%\"}"
temp="${temp#\"}"
echo "$temp"
