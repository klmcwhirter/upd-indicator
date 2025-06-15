#!/bin/sh
#*----------------------------------------------------------------------------*
#*----------------------------------------------------------------------------*

root=$(realpath $(dirname $0))

INCLUDE_UNITS=""
[ "$1" = "--include-systemd-units" ] && INCLUDE_UNITS="1"

[ "$1" = "--ext-only" ] && EXT_ONLY="1"

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

  echo_eval gnome-extensions pack --extra-source=ext-lib/ --extra-source=prefs-lib/ --extra-source=common-lib/ --extra-source=LICENSE --schema=schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml --force
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
    cat systemd/${service} | sed "s?~UPD_MONITOR_HOME~?${UPD_MONITOR_HOME}?g" >${cfg_dir}/${service}

    echo_eval install systemd/${timer} ${cfg_dir}

    echo_eval systemctl --user enable ${timer}
    echo_eval systemctl --user start ${timer}
    echo_eval systemctl --user enable ${service}
}
#*----------------------------------------------------------------------------*
function install_pgm
{
  echo_eval pdm run distclean
  echo_eval rm -fr ${UPD_MONITOR_HOME}
  echo_eval install -d ${UPD_MONITOR_HOME}
  echo_eval cp -r upd_monitor/ ${UPD_MONITOR_HOME}/
  # echo_eval rm -f ~/.local/bin/upd_monitor.sh
  echo install upd_monitor.sh ${UPD_MONITOR_HOME}/
  cat upd_monitor.sh | sed "s?~UPD_MONITOR_HOME~?${UPD_MONITOR_HOME}?g" >${UPD_MONITOR_HOME}/upd_monitor.sh
  chmod +x ${UPD_MONITOR_HOME}/upd_monitor.sh
}
#*----------------------------------------------------------------------------*

if [ "${EXT_ONLY}" = "1" ]
then
  pnpm run disable # make sure it is not running before starting nested session

  echo_eval install_ext
else
  echo_eval install_ext

  echo_eval install_pgm

  if [ "${INCLUDE_UNITS}" = "1" ]
  then
    echo_eval install_units
  fi
fi

#*----------------------------------------------------------------------------*
