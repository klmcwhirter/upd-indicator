# upd-indicator
GNOME extension that provides indication that updates are available

> [!IMPORTANT]
>
> What I am providing in this repo is a sample implementation of some ideas.
>
> You should not think of this repo as code that you can clone and use as is. Your requirements are going to be different than mine. Be prepared to heavily modify or even rewrite what is here.
>
> The files herein are simply a sample implementation of the ideas presented below.

## Background

Some indication of when various updates need my attention would be useful. And not just for OS updates, but various maintenance activities whether related to the local system or not.

If a command line can be crafted to provide an indication of when an update is available, that should be all that is needed - right?

Yes it is.

Have a favorite web service you monitor? `curl` it!

Tracking a channel on YouTube? If you can write a script to recognize new videos - do it!

Have some custom `systemd` units for maintenance? Just add an `echo` of [well-defined JSON](./docs/architecture-desgn.md#passing-json-out-of-rule-monitoring-command-scripts) to a file at a location YOU choose.

That should be all you need to define a monitoring rule that will cause an indicator to show when there is something that needs your attention.

## Installing the Extension

_See [upd-indicator@for-many](./upd-indicator@for-many/README.md) for details._

## Running the Python program to monitor for updates

It is written in Python and uses `Gio.Settings` to retrieve the extensions prefs.

_See [upd_monitor](./upd_monitor/README.md) for details._

And, after install, it is scheduled with [systemd](./systemd/README.md).

## Approach

GNOME extensions are written with GJS - where GJS ironically stands for [JavaScript for GNOME](https://gjs.guide/).

_Also see [docs/](./docs/README.md) for details._

## Demos / Examples

|Link|Description|
| --- | --- |
|[![phase 1 early demo with dummy data](./examples/phase1-dummy-data/phase1-with-dummy-data-thumbnail.png)](./examples/phase1-dummy-data/README.md)|Early demo during phase 1 with dummy data|
|[![phase 1 example demo thumbnail](./examples/phase1-demo/upd-indicator-example-rules-thumbnail.png)](./examples/phase1-demo/README.md)|shows rule definitions, the steps I take to resolve each item and shows each dropping off the list as they are updated|
|[![phase 2 demo thumbnail](./examples/phase2-demo/upd-indicator-phase2-demo-thumbnail.png)](./examples/phase2-demo/README.md)|shows the current state of upd-indicator as of phase 2 completion and shows rule detection / resolution|
|[`rules.json`](./examples/rules.json)|example rule.json file|
|[`settings.json`](./examples/settings.json)|example settings.json file|
|[`upd-indicator-monitor.service`](./systemd/upd-indicator-monitor.service)|sample upd-indicator-monitor.service systemd unit|
|[`upd-indicator-monitor.timer`](./systemd/upd-indicator-monitor.timer)|sample upd-indicator-monitor.timer systemd unit|
|[`etc/scripts/`](./etc/scripts/)|this is where scripts (associated with your rules) are placed so they get installed|

## Reference
- https://gjs.guide/
- https://gjs.guide/guides/gio/subprocesses.html
- https://gjs.guide/guides/gjs/asynchronous-programming.html
- https://gjs-docs.gnome.org/
- https://pygobject.gnome.org/getting_started.html#fedora-logo-fedora
- https://github.com/klmcwhirter/oci-shared-images
- https://github.com/klmcwhirter/uvextras
