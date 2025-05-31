#!/bin/sh

GNOME_EXT_HOME=$(realpath -L "$HOME/.local/share/gnome-shell/extensions")
EXT='upd-indicator@for-many'

ext_path="${GNOME_EXT_HOME}/${EXT}"

echo rm -fr ${ext_path}
rm -fr ${ext_path}
echo cp -r ${EXT} ${GNOME_EXT_HOME}
cp -r ${EXT} ${GNOME_EXT_HOME}
