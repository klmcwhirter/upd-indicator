# upd-indicator - Architecture & Design

### Monitor Program

```
     (2)                  (1)             (3)
gsettings  <---get--- upd_monitor ---> JSON files

```

### JSON file polling model

```
     (2)                      (1)                  (3)
JSON files  <---poll--- upd-indicator ---> read-only display

```

### Extension

The main deliverable is a [GNOME Extension](../upd-indicator@for-many/) written using [GJS](https://gjs.guide/extensions/development/creating.html).

Various Javascript related tools (e.g., pnpm, eslint, etc.) will be utilized to enable the development process.

Ancillary delivery is a reference implementation of a [monitor program](../upd_monitor/README.md) written in Python.

### Monitor Program

The monitor program reads the rules settings and executes the CLI commands to capture a snapshot of all the results. That snapshot is saved as individual JSON files - one for each command. Since each file is expected to contain an array of UpdateItem objects, each command may return multiple updates.

### IDE

I use VS Code with a defined Dev Container. This uses some custom install scripts to be sure all needed tools are available. _I have pnpm installed locally. You should not assume that is true in your case._

_See https://github.com/klmcwhirter/oci-shared-images for how the [devcontainer](../.devcontainer/devcontainer.json) base image is constructed._

### Delivery

For now, there is a `pnpm` script - `local:install` that publishes locally for testing in an embedded Wayland session.

```
pnpm run local:install

pnpm run nested
```

## Design

### Settings

For actual schema, see [schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml](../upd-indicator@for-many/schemas/org.gnome.shell.extensions.upd-indicator.gschema.xml).


Phase 2 context:
_See [settings.js](../upd-indicator@for-many/common-lib/settings.js)._

```
const ctx = {
    ...

    // https://gjs.guide/extensions/review-guidelines/review-guidelines.html#gsettings-schemas
    // "settings-schema": "org.gnome.shell.extensions.upd-indicator"

    monitorRate: settings.get_int('monitor-rate'),
    monitorLocation: settings.get_string('monitor-location'),
    blinkRate: settings.get_int('blink-rate'),
    doNotDisturbAtStart: settings.get_boolean('dnd-default'),

    icons: {
        'ind-green': settings.get_string('icon-ind-green'),
        'ind-updates': settings.get_string('icon-ind-updates'),
    },
    colors: {
        'ind-green': settings.get_string('color-ind-green'),
        'ind-normal': settings.get_string('color-ind-normal'),
        'ind-blink': settings.get_string('color-ind-blink'),
        'ind-dnd': settings.get_string('color-ind-dnd'),

        'dnd-label-on': settings.get_string('color-label-dnd-on'),
        'dnd-label-off': settings.get_string('color-label-dnd-off'),

        'menu-item-name': settings.get_string('color-label-menu-item-name'),
        'menu-item-status': settings.get_string('color-label-menu-item-status'),
        'menu-item-extra': settings.get_string('color-label-menu-item-extra'),
    },
    text: {
        'no-upd-avail': settings.get_string('text-no-upd-avail'),
        'no-upd-status': settings.get_string('text-no-upd-status'),
        'toggle-dnd': settings.get_string('text-toggle-dnd'),
    },

    rules: JSON.parse(settings.get_string('rules-list')).map(r => new MonitorRule(r))
};
```

### Passing JSON out of Rule Monitoring Command Scripts

When using a polled command, simply "echo" JSON output and return error code 0 to indicate updates available.

_See [examples/phase1-demo/](../examples/phase1-demo/README.md) for examples._

```
$ cpython-clone-behind.sh 
[{"name":"main","status":"behind"},{"name":"3.14","status":"behind","extra":"this is some very long text that will be displayed"}]
$ echo $?
0
```

The rule will have a field `notErrorCode` that will be used to detect a non-error return code - whether or not any updates are output.

If the process status code != `notErrorCode` - an exception is raised.

This is all that should be needed.

### JSON Output Must be an Array

If only one update record is output - it still MUST be an array.
```
$ cpython-clone-behind.sh 
[{"name":"main","status":"behind"}]
$ echo $?
0
```

### Use `jq` to Validate JSON

_Note that `jq` is used to validate the json. It is installed with `brew`. This is an incredibly helpful technique while writing rule scripts!_

```
# note no quotes surrounding name - a common mistake (when bouncing between JSON, Javascript and Python)
echo '[{ name: "malformed json","status":"updates" }]' | jq -cM .

# which will result in something like this:
jq: parse error: Invalid numeric literal at line 1, column 8

# once it is fixed ...
echo '[{ "name": "well formed json","status":"updates" }]' | jq -cM .
[{"name":"well formed json","status":"updates"}]
```

_See [example scripts](../examples/phase1-demo/README.md#scripts)._

### Class That Receives the Output

The Javascript class that receives the JSON object looks like this:
_See [`update-item.js`](../upd-indicator@for-many/common-lib/update-item.js)_

```
export class UpdateItem {
    name;
    status;
    extra;
...
}
```
