# upd-indicator
GNOME extension that provides indication that updates are available

> [!IMPORTANT]
> Before I even get started let me announce that I am looking for someone to fork and take over this project.
> 
> _I have other priorities that will always be placed higher than any software development work I do._
> 
> Let me know if you are interested so we can begin that transition.

## Background

There are a few of us using rpm-ostree enabled desktops that are frustrated with the lack of transparency of the update process. And we are not given a way to control the system with regards to the various types of updates that occur.

In addition, the auto system update process has not worked recently if the system is suspended or off at the time the update needs to run.

And when it does run, the update of things like `distroboxen` creates more troubleshooting issues than it solves.

Ideally we would have system level configuration about which auto-update rules "I" want enabled; and a Do Not Disturb button that disables auto update until "I" re-enable them.

Until this whole feature set (in bluefin-dx specifically in my case) matures some more - we (at least) need some indication of when various updates need our attention. Receiving that indication will trigger an activity to plan to reboot or take whatever other action is required for the rules "I" have enabled.

## Requirements

- [ ] Phase 1 - monitor `rpm-ostree status -v` output for new deployments and provide a status area indicator of that fact. When the indicator is clicked some summary of the update will be displayed. This will be a proving ground for the more flexibile implementation in phase 2.

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

   The extension should be flexible enough to run on any linux system eith GNOME.


## Approach

GNOME extensions are typically written with GJS - where GJS ironically stands for [JavaScript for GNOME](https://gjs.guide/). While other languages can be used, the Javascript bindings are most common.

## Status

2025-05-29 I have just created this repo and put up a call to action at [Bluefin - flexible update indicator project](https://universal-blue.discourse.group/t/bluefin-flexible-update-indicator-project/8844).

## Reference
- https://gjs.guide/
- https://gjs-docs.gnome.org/
