#!/bin/sh

root=$(realpath $(dirname $0))
GNOME_EXT_HOME=$(realpath -L "$HOME/.local/share/gnome-shell/extensions")
EXT='upd-indicator@for-many'

ext_path="${GNOME_EXT_HOME}/${EXT}"

echo rm -fr ${ext_path}
rm -fr ${ext_path}

pushd ${EXT}

echo glib-compile-schemas schemas/
glib-compile-schemas schemas/

echo cp ../LICENSE .
cp ../LICENSE .

echo gnome-extensions pack --extra-source=ext-lib/ --extra-source=prefs-lib/ --extra-source=common-lib/ --schema=schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml --force
gnome-extensions pack --extra-source=ext-lib/ --extra-source=prefs-lib/ --extra-source=common-lib/ --schema=schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml --force
echo gnome-extensions install upd-indicator@for-many.shell-extension.zip --force
gnome-extensions install upd-indicator@for-many.shell-extension.zip --force

popd

# echo cp -r ${EXT} ${GNOME_EXT_HOME}
# cp -r ${EXT} ${GNOME_EXT_HOME}

echo rm -f ${EXT}/LICENSE 
rm -f ${EXT}/LICENSE 

echo ln -sf ${root}/upd_monitor.sh ~/.local/bin
ln -sf ${root}/upd_monitor.sh ~/.local/bin
