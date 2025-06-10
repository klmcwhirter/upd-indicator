#!/usr/bin/env bash

source .devcontainer/vsc-utils.sh

echo $0: $(pwd)

which pnpm >/dev/null 2>&1
rc=$?

echo rc=$rc

if [[ $rc != 0 ]]
then
    echo "PATH=$PATH"
    mkdir -p ~/.local/bin

    echo "installing pnpm ..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -

    mkdir -p ~/.local/share/pnpm-store
    pnpm config set store-dir ~/.local/share/pnpm-store    
fi

# pick up the PATH modification
source ~/.bashrc

echo_eval rm -fr node_modules/
echo_eval pnpm install
