# NOTES

### Checking if updates are available in my distrobox
```
# dnf returns code 100 if updates are available
if ! distrobox enter fedora-python-dx -- sudo dnf check-upgrade >/dev/null 2>&1;then echo yep;else echo nope;fi
```

### Checking if my cpython clone is behind
```
cd ~/src/github.com/klmcwhirter/python-projects/cpython

git fetch origin

git switch main
if git status --branch -s --ahead-behind | grep behind >/dev/null 2>&1;then echo main yep;else echo main nope;fi
git switch -


git switch 3.14
if git status --branch -s --ahead-behind | grep behind >/dev/null 2>&1;then echo 3.14 yep;else echo 3.14 nope;fi
git switch -

```

### Reference
- https://gjs.guide/extensions/topics/extension.html
- https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/docs/building-and-running.md
- https://gjs.guide/guides/gio/list-models.html#basic-implementation
- https://dbus.freedesktop.org/doc/dbus-specification.html#basic-types