# upd_monitor - Rule Monitoring Program Reference Implementation

Python module that uses `Gio.Settings` to retrieve prefs and process the rules configured and enabled.

### Prerequisites

I build and install cpython 3.14 using a home built distrobox. So it was easy for me to simply add the prerequisites for the PyGObject pip module there.

Once re-assembled, inside the distrobox (`fedora-python-dx`) I then rebuilt cpython and installed the pycairo and PyGObject modules to my cpython installation. Installing those modules causes them to compile their C-extensions and install them "globally". Once that is done, I could exit the distrobox.

So I did not need to do anything special in this project.

_See [oci-shared-images - Containerfile.fedora-python](https://github.com/klmcwhirter/oci-shared-images/blob/master/fedora/Containerfile.fedora-python) for details_

## Running upd_monitor

Once the prerequisites have been met (namely, locally compile cpython 3.14 with PyGObject installed "globally") run the `./upd_monitor.sh` script from the root of the cloned repo dir on the host.

It expects that `pnpm run local:install` has been executed so that the gsettings have been compiled and installed, and the `~/.local/bin/upd_monitor.sh` symlink has been established.

```
upd_monitor.sh list -s
```

This should display the gsettings in place.

```
{'monitor': {'rate': 900000, 'location': '/run/user/1000/upd-indicator/updates'},
 'blink': {'rate': 5000},
 'dnd': {'default': False},
 'icons': {'ind-green': 'selection-mode-symbolic',
           'ind-updates': 'software-update-available-symbolic'},
 'colors': {'ind-green': 'lightgreen',
            'ind-normal': 'white',
            'ind-blink': 'cornflowerblue',
            'ind-dnd': 'gray',
            'dnd-label-on': 'red',
            'dnd-label-off': 'white',
            'menu-item-name': 'lightgray',
            'menu-item-status': 'aquamarine',
            'menu-item-extra': 'cornflowerblue'},
 'text': {'no-upd-avail': 'No Updates Available',
          'no-upd-status': 'Everything is up to date.',
          'toggle-dnd': 'Toggle Do Not Disturb.'},
 'rules': [{'name': 'bluefin',
            'description': 'check if there are updates to bluefin via rpm-ostree',
            'enabled': True,
            'command': 'rpm-ostree-update-check.sh',
            'notErrorCode': 0},
           {'name': 'cpython fork behind',
            'description': 'check if there are missing commits in my cpython fork',
            'enabled': True,
            'command': 'cpython-clone-behind.sh',
            'notErrorCode': 0},
           {'name': 'fedora-python-dx',
            'description': 'check if there are updates to fedora-python-dx',
            'enabled': True,
            'command': 'fedora-python-dx-has-updates.sh',
            'notErrorCode': 0}]}
```

## Systemd

But, the intention is that `upd_monitor` be orchestrated via [`systemd` units](../systemd/README.md).

## References
- https://pygobject.gnome.org/getting_started.html#fedora-logo-fedora
- https://github.com/klmcwhirter/oci-shared-images/

