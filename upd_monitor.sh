#!/bin/bash

repo=$(realpath "$HOME/src/github.com/klmcwhirter/upd-indicator")

UPD_MONITOR_HOME=~UPD_MONITOR_HOME~
[ "${PWD}" = "${repo}" ] && UPD_MONITOR_HOME=""

if [ -n "${UPD_MONITOR_HOME:-}" -a "${PWD}" != "${repo}" ]
then
  echo "GOING HOME"
  cd "${UPD_MONITOR_HOME}"

  source ~/.bashrc >/dev/null 2>&1
fi

export PATH=${PWD}/etc/scripts:$PATH

export PATH=$HOME/opt/cpython/bin:$PATH

GSETTINGS_SCHEMA_DIR=$HOME/.local/share/gnome-shell/extensions/upd-indicator@for-many/schemas python3.14 -m upd_monitor $@
