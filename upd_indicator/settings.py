import json
from typing import Any

# THESE LINES MUST OCCUR IN THIS EXACT ORDER - START
import gi  # isort:skip
gi.require_version('Gio', '2.0')  # isort:skip
gi.require_version('GLib', '2.0')  # isort:skip
gi.require_version('Gtk', '4.0')  # isort:skip
from gi.repository import Gio, GLib, Gtk  # isort:skip
# THESE LINES MUST OCCUR IN THIS EXACT ORDER - END


def from_settings(settings: Gio.Settings = None) -> dict:
    if settings is None:
        settings = Gio.Settings.new('org.gnome.shell.extensions.upd-indicator')

    rc = {
        'monitor': {
            'rate': settings.get_int('monitor-rate'),
            'location': settings.get_string('monitor-location'),
        },
        'blink': {
            'rate': settings.get_int('blink-rate'),
            'default': settings.get_boolean('dnd-default'),
        },

        'icons': {
            'ind-green': settings.get_string('icon-ind-green'),
            'ind-updates': settings.get_string('icon-ind-updates'),
        },

        'colors': {
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

        'text': {
            'no-upd-avail': settings.get_string('text-no-upd-avail'),
            'no-upd-status': settings.get_string('text-no-upd-status'),
            'toggle-dnd': settings.get_string('text-toggle-dnd'),
        },

        'rules': json.loads(settings.get_string('rules-list'))

    }
    return rc


if __name__ == '__main__':
    wrapper = from_settings()
    print(json.dumps(wrapper, sort_keys=False))
