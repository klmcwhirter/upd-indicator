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


## References
- https://pygobject.gnome.org/getting_started.html#fedora-logo-fedora
- https://github.com/klmcwhirter/oci-shared-images/

