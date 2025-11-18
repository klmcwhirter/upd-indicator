#!/bin/sh
#*----------------------------------------------------------------------------*
#* Name: local-install.sh
#*
#* Install components locally.
#* 
#*----------------------------------------------------------------------------*

root=$(realpath $(dirname $0))

INCLUDE_UNITS=""
[ "$1" = "--include-systemd-units" ] && INCLUDE_UNITS="1"

[ "$1" = "--ext-only" ] && EXT_ONLY="1"
[ "$1" = "--pgm-only" ] && PGM_ONLY="1"
[ "$1" = "--units-only" ] && UNITS_ONLY="1"

UPD_MONITOR_HOME=$HOME/.local/share/upd-monitor

#*----------------------------------------------------------------------------*
function echo_eval
{
    echo $*
    $*
}
#*----------------------------------------------------------------------------*
function install_ext
{
  local gnome_ext_home=$(realpath -L "$HOME/.local/share/gnome-shell/extensions")
  local ext='upd-indicator@for-many'

  ext_path="${gnome_ext_home}/${ext}"

  echo_eval rm -fr ${ext_path}

  echo_eval pushd ${ext}

  echo_eval glib-compile-schemas schemas/

  echo_eval cp ../LICENSE .

  echo_eval gnome-extensions pack --extra-source=ext-lib/ --extra-source=common-lib/ --extra-source=LICENSE --schema=schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml --force
  echo_eval gnome-extensions install upd-indicator@for-many.shell-extension.zip --force

  echo_eval popd

  echo_eval rm -f ${ext}/LICENSE 
}
#*----------------------------------------------------------------------------*
function install_units
{
    local cfg_dir=~/.config/systemd/user/
    local timer="upd-indicator-monitor.timer"
    local service="upd-indicator-monitor.service"

    if [ -f ${cfg_dir}/${timer} ]
    then
      echo_eval systemctl --user stop ${timer}
    fi

    if [ -f ${cfg_dir}/${service} ]
    then
      echo_eval systemctl --user stop ${service}
      echo_eval systemctl --user disable ${service}
    fi

    echo_eval rm -fr ${cfg_dir}
    echo_eval mkdir -p ${cfg_dir}
    
    echo "install ${service}"
    cat etc/${service}.in | sed "s?~UPD_MONITOR_HOME~?${UPD_MONITOR_HOME}?g" >${cfg_dir}/${service}

    echo_eval install etc/${timer} ${cfg_dir}

    echo_eval systemctl --user enable ${timer}
    echo_eval systemctl --user start ${timer}
    echo_eval systemctl --user enable ${service}
}
#*----------------------------------------------------------------------------*
function install_pgm
{
  echo_eval rm -fr ${UPD_MONITOR_HOME}
  echo_eval install -d ${UPD_MONITOR_HOME}
  
  echo_eval uvextras run allclean
  echo_eval cp -r upd_monitor/ ${UPD_MONITOR_HOME}/
  echo_eval cp -r etc/scripts/ ${UPD_MONITOR_HOME}/
  
  echo install upd_monitor.sh ${UPD_MONITOR_HOME}/
  cat etc/upd_monitor.sh.in | sed "s?~UPD_MONITOR_HOME~?${UPD_MONITOR_HOME}?g" >${UPD_MONITOR_HOME}/upd_monitor.sh
  chmod +x ${UPD_MONITOR_HOME}/upd_monitor.sh

  echo_eval cp etc/rules.json ${UPD_MONITOR_HOME}
  echo install settings.json ${UPD_MONITOR_HOME}/
  cat etc/settings.json.in | sed "s?~UPD_MONITOR_HOME~?${UPD_MONITOR_HOME}?g;s?~UID~?${UID}?g" >${UPD_MONITOR_HOME}/settings.json

  echo uvextras run create
  uvextras run create

  echo install check-4-upds.sh to cluster
  for h in pi1.lan pi2.lan pi3.lan
  do
    echo scp -p ./etc/check-4-upds.sh ${h}:/home/klmcw/.local/bin/check-4-upds.sh
    scp -p ./etc/check-4-upds.sh ${h}:/home/klmcw/.local/bin/check-4-upds.sh
  done

  ./upd_monitor.sh import -j ${UPD_MONITOR_HOME}/settings.json -v
}
#*----------------------------------------------------------------------------*

if [ "${EXT_ONLY}" = "1" ]
then
  pnpm run disable # make sure it is not running before starting nested session

  echo_eval install_ext
elif [ "${PGM_ONLY}" = "1" ]
then
  echo_eval install_pgm
elif [ "${UNITS_ONLY}" = "1" ]
then
  echo_eval install_units
else
  echo_eval install_ext

  echo_eval install_pgm

  if [ "${INCLUDE_UNITS}" = "1" ]
  then
    echo_eval install_units
  fi
fi

#*----------------------------------------------------------------------------*
