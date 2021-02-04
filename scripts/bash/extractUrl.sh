#!/bin/bash

read -r INPUT_JSON

IFS="}" read -r -a JSON_PARTS <<<"$INPUT_JSON"
IFS=":" read -r -a LOCATION_LINE <<<"${JSON_PARTS[0]}"
unset IFS

LOCATION="${LOCATION_LINE[1]}:${LOCATION_LINE[2]}"

right="${LOCATION%\"}"
left="${right#\"}"
echo "$left"
