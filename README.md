# upd-indicator
GNOME extension that provides indication that updates are available

> [!IMPORTANT]
> Before I even get started let me announce that I am looking for someone to fork and take over this project.
> 
> _I have other priorities that will always be placed higher than any software development work I do._
> 
> Let me know if you are interested so we can begin that transition.

## Background

Some indication of when various updates need our attention wouild be useful. And not just for OS updates, but various maintenance activities whether related to the local system or not.

If a command line can be crafted to provide an indication of when an update is available, that should be all that is needed?

Have a favorite web service you monitor? `curl` it!

Tracking a channel on YouTube? If you can write a script to recognize new videos - do it!

Have some custom `systemd` units for maintenance? Just send a D-Bus message.

That should be all you need to define a monitoring rule that will cause an indicator to show when there is something that needs your attention.

## Requirements

- [ ] Phase 1 - monitor `rpm-ostree status -v` output for new deployments and provide a status area indicator of that fact. When the indicator is clicked some summary of the update will be displayed. This will be a proving ground for the more flexibile implementation in phase 2.

TODO - actually monitor `rpm-ostree status` and convert the notification to a dialog displaying a list.

![Phase 1 Demo w/Random hard-coded data](https://github.com/klmcwhirter/stuff/blob/master/upd-indicator-phase1-dummy-data.gif)

I am pretty happy with this rough draft UI, though. Progress is being made.


- [ ] Phase 2 - add configuration for blinking rate and a "rule editor" so that the user can add their own rules based on what they care about.

   The rules will have at least these properties (detailed design TBD):
   - name
   - icon
   - enabled
   - command to monitor
   - expected response that means “updates available”
   - comments to display with the output (might be reminder of the command to run, docs, etc.)
   
   The user will have the ability to disable / enable any rule individually. And add their own rules.
   
   There will also be a global “Do not disturb” button to disable / re-enable monitoring.

   The extension should be flexible enough to run on any linux system with GNOME.


## Running the Prototype

The automation uses pnpm / npm. This is a JS project after all. While it is not strictly needed, that is what I am currently using.

See the scripts section in [package.json](./package.json). You can just copy the commands to run from there.

These steps come straight from the [Getting Started section in the GJS Guide](https://gjs.guide/extensions/development/creating.html#wayland-sessions).

I use the terminal in VS Code - it works fine for this. But any old terminal session will do.

Also I found that Ptyxis is painfully slow to start in the nested Wayland session. So I installed the Foot flatpak and use it in the nested session instead.

Steps:

- in the current session - `pnpm run local:install`; this copies the needed stuff to `~/.local/share/gnome-shell/extensions/`
- next, `pnpm run nested`; this will open the nested session in a window
- in the nested session open a terminal - I use Foot as I mentioned.
- in the nested terminal session cd to the dir where you cloned, and execute `pnpm run enable`. This takes about 30 secs for whatever reason.

You will begin to see the UI change in the nested session and the log output in the outer current session

To shutdown, do `pnpm run disable` in the nested session, log out of the nested session and close the window.

You should be back where you started and ready to launch again.

## Approach

GNOME extensions are typically written with GJS - where GJS ironically stands for [JavaScript for GNOME](https://gjs.guide/). While other languages can be used, the Javascript bindings are most common.

## Status

2025-05-29 I have just created this repo and put up a call to action at [Bluefin - flexible update indicator project](https://universal-blue.discourse.group/t/bluefin-flexible-update-indicator-project/8844).
2025-05-30 Got a rough draft of the status bar UI completed and captured a demo amimated gif. See above.

## Reference
- https://gjs.guide/
- https://gjs-docs.gnome.org/
