# dnf returns code 100 if updates are available
distrobox enter fedora-python-dx -- sudo dnf check-upgrade >/dev/null 2>&1
rc=$?

if [[ $rc == 100 ]]
then
  rc=0
  echo '[{ "name": "fedora-python-dx", "status": "has updates" }]' | jq -cM .
fi

exit $rc
