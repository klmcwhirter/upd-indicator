# dnf returns code 100 if updates are available

# CURR_CONTAINER_NAME is set in ~/.local/.bash.d/distrobox

if [ "$1" = "-u" ]
then
  distrobox enter ${CURR_CONTAINER_NAME} -- sudo dnf update -y 1>&2
elif [ "$1" = "-v" ]
then
  distrobox enter ${CURR_CONTAINER_NAME} -- sudo dnf check-upgrade 1>&2
else
  distrobox enter ${CURR_CONTAINER_NAME} -- sudo dnf check-upgrade >/dev/null 2>&1
fi
rc=$?

if [[ $rc == 100 ]]
then
  rc=0
  echo '[{ "name": "'${CURR_CONTAINER_NAME}'", "status": "has updates" }]' | jq -cM .
fi

exit $rc
