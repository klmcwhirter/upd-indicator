# upd-indicator
GNOME extension that provides indication that updates are available

> [!IMPORTANT]
> Before I even get started let me announce that I am looking for someone to fork and take over this project.
> 
> _I have other priorities that will always be placed higher than any software development work I do._
> 
> Let me know if you are interested so we can begin that transition.

## Background

Some indication of when various updates need our attention would be useful. And not just for OS updates, but various maintenance activities whether related to the local system or not.

If a command line can be crafted to provide an indication of when an update is available, that should be all that is needed - right?

Yes it is.

Have a favorite web service you monitor? `curl` it!

Tracking a channel on YouTube? If you can write a script to recognize new videos - do it!

Have some custom `systemd` units for maintenance? Just send a D-Bus message.

That should be all you need to define a monitoring rule that will cause an indicator to show when there is something that needs your attention.

## Milestones

- Phase 1 - prototype
   - indicator of mode: Do Not Disturb, Updates available, All green
   - monitoring logic rough draft
   - do not disturb mode
   - when the indicator is clicked some summary of the update will be displayed.
   - start with hard coded dummy data
   - monitor my `cpython-clone-behind.sh` script output for new commits.
   
This will be a proving ground for the more flexibile implementation in phase 2.

I am pretty happy with this rough draft UI, though. Time to move to phase 2.

Status: 👍

<details>

<summary>Expand to see the phase 1 demo ...</summary>

![Phase 1 Demo](https://github.com/klmcwhirter/stuff/blob/master/upd-indicator-phase1-dummy-data.gif)

</details>


- Phase 2 - add configuration for blinking rate and a "rule editor" so that the user can add their own rules based on what they care about.

   The rules will have at least these properties (detailed design TBD):
   - name
   - enabled
   - command to monitor
   - expected response that means “updates available”
   - comments to display with the output (might be reminder of the command to run, docs, etc.)
   
   The user will have the ability to disable / enable any rule individually. And add their own rules.
   
   The extension should be flexible enough to run on any linux system with GNOME.

- Phase 2 themes:

   * prefs definition and editor
   * program written in Python to be executed via systemd
   * example rules and scripts
   * Documentation !


Status: implementation

## Running the Python program to monitor for updates

It is written in Python and uses `Gio.Settings` to retrieve the extensions prefs.

_See [upd_indicator](./upd_indicator/README.md) for details._

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
- in the nested terminal session cd to the dir where you cloned, and execute `pnpm run enable` once the session has initialized.

> Note it takes about 30 secs for the nested shell session to initialize.

You will begin to see the UI change in the nested session and the log output in the outer current session

To shutdown, do `pnpm run disable` in the nested session, and close the window.

You should be back where you started and ready to launch again.

## Approach

GNOME extensions are written with GJS - where GJS ironically stands for [JavaScript for GNOME](https://gjs.guide/).

## Status

- 2025-05-29 I have just created this repo and put up a call to action at [Bluefin - flexible update indicator project](https://universal-blue.discourse.group/t/bluefin-flexible-update-indicator-project/8844).
- 2025-05-30 Got a rough draft of the status bar UI completed and captured a demo amimated gif. See above.
- 2025-06-05 The summary display is working; although notification is _possible_ it is not clear how to do that. It is disabled for now.
- 2025-06-06 Added devcontainer definition - cannot perform `pnpm run nested` in the devcontainer - run it on the host instead !
- 2025-06-07 Added pollingRuleAdapter, CompositeRuleAdapter class and demos - completed phase 1 ! Started phase 2 design
- 2025-06-12 Added upd_indicator Python program to monitor CLI commands and place json files in `monitor-location`; revised `upd-indicator` extension to poll that dir for `json` files. _See [#22](https://github.com/klmcwhirter/upd-indicator/issues/22)_

## Examples

|Link|Description|
| --- | --- |
|[![phase 1 example demo thumbnail](./examples/phase1-demo/upd-indicator-example-rules-thumbnail.png)](./examples/phase1-demo/README.md)|shows rule definitions, the steps I take to resolve each item and shows each dropping off the list as they are updated|

## Reference
- https://gjs.guide/
- https://gjs.guide/guides/gio/subprocesses.html
- https://gjs.guide/guides/gjs/asynchronous-programming.html
- https://gjs-docs.gnome.org/
- https://pygobject.gnome.org/getting_started.html#fedora-logo-fedora
