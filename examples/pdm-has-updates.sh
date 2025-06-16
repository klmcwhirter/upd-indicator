#!/bin/bash

new_ver=$(pdm self list 2>&1 >/dev/null | awk '/^INFO:/ { new_ver=$7 } END { print new_ver; }')

if [ -n "${new_ver}" ]
then
  echo "[{ \"name\":\"pdm\", \"status\":\"new ver ${new_ver} avail\" }]"
  exit 0
fi

