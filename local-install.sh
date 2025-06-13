#!/bin/sh

function echo_eval
{
    echo $*
    $*
}

INCLUDE_UNITS=""
if [ "$1" = "--include-systemd-units" ]
then
    INCLUDE_UNITS="1"
fi

root=$(realpath $(dirname $0))
GNOME_EXT_HOME=$(realpath -L "$HOME/.local/share/gnome-shell/extensions")
EXT='upd-indicator@for-many'

ext_path="${GNOME_EXT_HOME}/${EXT}"

echo_eval rm -fr ${ext_path}

echo_eval pushd ${EXT}

echo_eval glib-compile-schemas schemas/

echo_eval cp ../LICENSE .

echo_eval gnome-extensions pack --extra-source=ext-lib/ --extra-source=prefs-lib/ --extra-source=common-lib/ --schema=schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml --force
echo_eval gnome-extensions install upd-indicator@for-many.shell-extension.zip --force

echo_eval popd

echo_eval rm -f ${EXT}/LICENSE 

echo_eval ln -sf ${root}/upd_monitor.sh ~/.local/bin

if [ "${INCLUDE_UNITS}" = "1" ]
then
  CFG_DIR=~/.config/systemd/user/
  TIMER="upd-indicator-monitor.timer"
  SERVICE="upd-indicator-monitor.service"

  if [ -f ${CFG_DIR}/${TIMER} ]
  then
    echo_eval systemctl --user stop ${TIMER}
  fi

  if [ -f ${CFG_DIR}/${SERVICE} ]
  then
    echo_eval systemctl --user stop ${SERVICE}
    echo_eval systemctl --user disable ${SERVICE}
  fi

  echo_eval rm -fr ${CFG_DIR}
  echo_eval mkdir -p ${CFG_DIR}
  echo_eval install systemd/${SERVICE} ${CFG_DIR}

  echo_eval install systemd/${TIMER} ${CFG_DIR}
  echo_eval systemctl --user enable ${TIMER}
  echo_eval systemctl --user start ${TIMER}
  echo_eval systemctl --user enable ${SERVICE}
fi
