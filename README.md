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

Have some custom `systemd` units for maintenance? Just add an `echo` of [well-defined JSON](./docs/architecture-desgn.md#passing-json-out-of-rule-monitoring-command-scripts) to a file at a location YOU choose.

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

I am pretty happy with the rough draft UI, though. Time to move to phase 2.

Status: 👍

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

_See [upd_monitor](./upd_monitor/README.md) for details._

## Running the Prototype

_See [upd-indicator@for-many](./upd-indicator@for-many/README.md)._

## Approach

GNOME extensions are written with GJS - where GJS ironically stands for [JavaScript for GNOME](https://gjs.guide/).

_Also see [docs/](./docs/README.md) for details._

## Status

- 2025-05-29 I have just created this repo and put up a call to action at [Bluefin - flexible update indicator project](https://universal-blue.discourse.group/t/bluefin-flexible-update-indicator-project/8844).
- 2025-05-30 Got a rough draft of the status bar UI completed and captured a demo amimated gif. See above.
- 2025-06-05 The summary display is working; although notification is _possible_ it is not clear how to do that. It is disabled for now.
- 2025-06-06 Added devcontainer definition - cannot perform `pnpm run nested` in the devcontainer - run it on the host instead !
- 2025-06-07 Added pollingRuleAdapter, CompositeRuleAdapter class and demos - completed phase 1 ! Started phase 2 design
- 2025-06-12 Added upd_indicator Python program to monitor CLI commands and place json files in `monitor-location`; revised `upd-indicator` extension to poll that dir for `json` files. _See [#22](https://github.com/klmcwhirter/upd-indicator/issues/22)_
- 2025-06-13 Renamed upd_indicator to upd_monitor; added reference systemd units to orchestrate its invocation

## Demos / Examples

|Link|Description|
| --- | --- |
|[![phase 1 early demo with dummy data](./examples/phase1-dummy-data/phase1-with-dummy-data-thumbnail.png)](./examples/phase1-dummy-data/README.md)|Early demo during phase 1 with dummy data|
|[![phase 1 example demo thumbnail](./examples/phase1-demo/upd-indicator-example-rules-thumbnail.png)](./examples/phase1-demo/README.md)|shows rule definitions, the steps I take to resolve each item and shows each dropping off the list as they are updated|

## Reference
- https://gjs.guide/
- https://gjs.guide/guides/gio/subprocesses.html
- https://gjs.guide/guides/gjs/asynchronous-programming.html
- https://gjs-docs.gnome.org/
- https://pygobject.gnome.org/getting_started.html#fedora-logo-fedora
