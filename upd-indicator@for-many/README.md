# upd-indicator@for-many

A GNOME extension to display updates that need attention.

_See [docs](../docs/README.md) for details._

## Installing the Extension

- run `pnpm run local:install`
- log out and back in (or reboot)
- run `pnpm run enable` or Enable in Extension Manager

## Running the Extension (development)

The automation uses pnpm / npm. This is a JS project after all. While it is not strictly needed, that is what I am currently using.

See the scripts section in [package.json](../package.json). You can just copy the commands to run from there.

These steps come straight from the [Getting Started section in the GJS Guide](https://gjs.guide/extensions/development/creating.html#wayland-sessions).

I use the terminal in VS Code - it works fine for this. But any old terminal session will do.

Also I found that Ptyxis is painfully slow to start in the nested Wayland session. So I installed the Foot flatpak and use it in the nested session instead.

Steps:

- in the current session - `pnpm run dev:install`; this copies the needed stuff to `~/.local/share/gnome-shell/extensions/`
- next, `pnpm run nested`; this will open the nested session in a window
- in the nested session open a terminal - I use Foot as I mentioned.
- in the nested terminal session cd to the dir where you cloned, and execute `pnpm run enable` once the session has initialized.

> Note it takes about 30 secs for the nested shell session to initialize.

You will begin to see the UI change in the nested session and the log output in the outer current session

To shutdown, do `pnpm run disable` in the nested session, and close the window.

You should be back where you started and ready to launch again.
