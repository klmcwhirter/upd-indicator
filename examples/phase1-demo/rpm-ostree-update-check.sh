
rpm-ostree upgrade --check >/dev/null 2>&1
rc=$?

if [[ $rc != 77 ]]
then
  rc=0
  echo '[{ "name": "bluefin", "status": "updates" }]' | jq -cM .
elif [[ $rc == 77 ]]
then
  rc=0
fi

exit $rc
