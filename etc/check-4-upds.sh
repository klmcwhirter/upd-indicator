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
apt update -qy >/dev/null

# Check for available updates
if ! apt list --upgradable; then
  echo "Error: Updates are available"
  exit 1
else
  echo "No updates available"
  exit 0
fi

# If we reach this point, something has gone wrong
echo "Error: Failed to check for updates"
exit 1
