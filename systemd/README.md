# systemd units

Place these in `~/.config/systemd/user`. 

> _You may need to create the dir first with `mkdir -p ~/.config/systemd/user/`_.

Those things (and several others) are automated via `pnpm run local:install`.

- [upd-indicator-monitor.timer](./upd-indicator-monitor.timer) - triggers the service every 2 hours
- [upd-indicator-monitor.service](./upd-indicator-monitor.service) - executes upd_monitor.sh

Please review both of those to make sure they meet your needs.
