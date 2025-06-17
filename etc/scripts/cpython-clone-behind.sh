#!/bin/bash

rc=0
UPDATES=''

function add_update
{
  local name=$1

  [ -n "${UPDATES}" ] && UPDATES="${UPDATES},"
  UPDATES="${UPDATES}"'{ "name": "'${name}'", "status": "behind" }'
}

cd ~/src/github.com/klmcwhirter/python-projects/cpython

git fetch origin >/dev/null 2>&1

git switch main >/dev/null 2>&1
if git status --branch -s --ahead-behind | grep behind >/dev/null 2>&1;then add_update "cpython#main";rc=0;fi
git switch - >/dev/null 2>&1


git switch 3.14 >/dev/null 2>&1
if git status --branch -s --ahead-behind | grep behind >/dev/null 2>&1;then add_update "cpython#3.14";rc=0;fi
git switch - >/dev/null 2>&1

if [ -n "${UPDATES}" ]
then
  echo "[ ${UPDATES} ]" | jq -cM .
fi

# echo "$0 STDERR: this is a test" >&2

exit $rc
