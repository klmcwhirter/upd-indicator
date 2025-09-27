#!/bin/bash

##
## pi-cluster-health.py assumes this is installed on pi2.lan and pi3.lan in ~/.local/bin/check-4-upds.sh
##

# Check if we have permission to update packages
if [ "$(id -u)" -ne 0 ]; then
  echo "Error: This script needs to run as root"
  exit 1
fi

# Update the package list
apt-get update -qy >/dev/null

if [ "$1" = "-v" ]; then
  apt list --upgradeable -a
fi

# ----------------- this spelling diff is intentional -----v
updates=$(apt list --upgradeable 2>/dev/null | grep -- 'upgradable' -)
# echo "updates=${updates}"

# Check for available updates
if [ "${updates}" != "" ]; then
  echo "Updates are available"
  echo
  exit 1
else
  echo "No updates available"
  echo
  exit 0
fi

# If we reach this point, something has gone wrong
echo "Error: Failed to check for updates"
exit 2
