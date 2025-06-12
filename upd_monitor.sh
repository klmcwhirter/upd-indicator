#!/bin/bash

cd ~/src/github.com/klmcwhirter/upd-indicator

source ~/.bashrc >/dev/null 2>&1

GSETTINGS_SCHEMA_DIR=$HOME/.local/share/gnome-shell/extensions/upd-indicator@for-many/schemas python -m upd_monitor $@
