
rpm-ostree upgrade --check --unchanged-exit-77 >/dev/null 2>&1
rc=$?

if [[ $rc == 77 ]]
then
  rc=0
elif [[ $rc == 0 ]]
then
  rc=0
  echo '[{ "name": "bluefin", "status": "updates" }]' | jq -cM .
fi

exit $rc
