# Phase 2 Demo - Example Rules and Resolution Session

In this clip I show the current state of upd-indicator and show rule detection / resolution.

![demo snapshot](upd-indicator-phase2-demo.png)

In the list of updates are the bluefin OS, branches of my cpython clone, my fedora-python-dx distrobox and pdm. All need some attention.

The clip shows the settings, the rule definitions, the steps I take to resolve each item and shows each dropping off the list as they are updated.

See below for links to the individual artifacts.

![upd-indicator-phase2-demo.gif](https://github.com/klmcwhirter/stuff/blob/master/upd-indicator-phase2-demo.gif)

## Artifacts

- [Settings](settings.json) - the settings that were imported during `pnpm run local:install`
- [Rules](rules.json) - the extensions prefs screen will have an import / export feature

#### Scripts

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

- [rpm-ostree-update-check.sh](rpm-ostree-update-check.sh)
- [cpython-clone-behind.sh](cpython-clone-behind.sh)
- [fedora-python-dx-has-updates.sh](fedora-python-dx-has-updates.sh)
- [pdm-has-updates.sh](pdm-has-updates.sh)
