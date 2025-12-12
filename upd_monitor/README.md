# upd_monitor - Rule Monitoring Program Reference Implementation

Python module that uses `Gio.Settings` to retrieve prefs and process the rules configured and enabled.

### Prerequisites

> WARNING - I do not recommend relying on the pre-installed software in a bootc-based OS. This is the only place I am doing.

I use python 3.14 that is installed by default in bluefin-dx. So it was easy for me to simply reuse the prerequisites for the PyGObject pip module there.

I did not need to do anything special in this project.

## Running upd_monitor

Run the `./upd_monitor.sh` script from the root of the cloned repo dir on the host.

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
 'rules-path': '/var/home/klmcw/.local/share/upd-monitor/rules.json'}
```

## Systemd

But, the intention is that `upd_monitor` be orchestrated via [`systemd` units](../systemd/README.md).

## References
- https://pygobject.gnome.org/getting_started.html#fedora-logo-fedora
- https://github.com/klmcwhirter/uvextras
