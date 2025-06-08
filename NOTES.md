# NOTES

### Checking if updates are available in my distrobox
```
# dnf returns code 100 if updates are available
distrobox enter fedora-python-dx -- sudo dnf check-upgrade >/dev/null 2>&1
rc=$?

if [[ $rc == 100 ]]
then
  rc=0
  echo '[{ "name": "fedora-python-dx", "status": "has updates" }]' | jq -cM .
fi

exit $rc
```

### Checking if my cpython clone is behind
```
# cpython-clone-behind.sh
#!/bin/bash

rc=0
UPDATES='['

cd ~/src/github.com/klmcwhirter/python-projects/cpython

git fetch origin >/dev/null 2>&1

git switch main >/dev/null 2>&1
if git status --branch -s --ahead-behind | grep behind >/dev/null 2>&1;then UPDATES="${UPDATES} "'{ "name": "cpython#main", "status": "behind" },';rc=0;fi
git switch - >/dev/null 2>&1


git switch 3.14 >/dev/null 2>&1
if git status --branch -s --ahead-behind | grep behind >/dev/null 2>&1;then UPDATES="${UPDATES} "'{ "name": "cpython#3.14", "status": "behind" }';rc=0;fi
git switch - >/dev/null 2>&1

echo "${UPDATES} ]" | jq -cM .

echo "$0 STDERR: this is a test" >&2

exit $rc
```

### Reference
- https://gjs.guide/extensions/topics/extension.html
- https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/docs/building-and-running.md
- https://gjs.guide/guides/gio/list-models.html#basic-implementation
- https://dbus.freedesktop.org/doc/dbus-specification.html#basic-types