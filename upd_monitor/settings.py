import json
import logging
from pprint import pformat

# THESE LINES MUST OCCUR IN THIS EXACT ORDER - START
import gi  # isort:skip
gi.require_version('Gio', '2.0')  # isort:skip
gi.require_version('GLib', '2.0')  # isort:skip
gi.require_version('Gtk', '4.0')  # isort:skip
from gi.repository import Gio, GLib, Gtk  # isort:skip
# THESE LINES MUST OCCUR IN THIS EXACT ORDER - END


def from_settings(gsettings: Gio.Settings = None) -> dict:
    if gsettings is None:
        gsettings = Gio.Settings.new('org.gnome.shell.extensions.upd-indicator')

    rc = {
        'monitor': {
            'rate': gsettings.get_int('monitor-rate'),
            'location': gsettings.get_string('monitor-location'),
        },

        'blink': {
            'rate': gsettings.get_int('blink-rate'),
        },

        'dnd': {
            'default': gsettings.get_boolean('dnd-default'),
        },

        'icons': {
            'ind-green': gsettings.get_string('icon-ind-green'),
            'ind-updates': gsettings.get_string('icon-ind-updates'),
        },

        'colors': {
            'ind-green': gsettings.get_string('color-ind-green'),
            'ind-normal': gsettings.get_string('color-ind-normal'),
            'ind-blink': gsettings.get_string('color-ind-blink'),
            'ind-dnd': gsettings.get_string('color-ind-dnd'),

            'dnd-label-on': gsettings.get_string('color-label-dnd-on'),
            'dnd-label-off': gsettings.get_string('color-label-dnd-off'),

            'menu-item-name': gsettings.get_string('color-label-menu-item-name'),
            'menu-item-status': gsettings.get_string('color-label-menu-item-status'),
            'menu-item-extra': gsettings.get_string('color-label-menu-item-extra'),
        },

        'text': {
            'next-poll': gsettings.get_string('text-next-poll'),
            'no-upd-avail': gsettings.get_string('text-no-upd-avail'),
            'no-upd-status': gsettings.get_string('text-no-upd-status'),
            'toggle-dnd': gsettings.get_string('text-toggle-dnd'),
        },

        'rules-path': gsettings.get_string('rules-path')
    }
    return rc


def import_settings(settings: dict, gsettings: Gio.Settings = None):
    if gsettings is None:
        gsettings = Gio.Settings.new('org.gnome.shell.extensions.upd-indicator')

    logging.debug(f'\nsettings={pformat(settings, sort_dicts=False)}')

    gsettings.set_int('monitor-rate', settings['monitor']['rate'])
    gsettings.set_string('monitor-location', settings['monitor']['location'])

    gsettings.set_int('blink-rate', settings['blink']['rate'])

    gsettings.set_boolean('dnd-default', settings['dnd']['default'])

    gsettings.set_string('icon-ind-green', settings['icons']['ind-green'])
    gsettings.set_string('icon-ind-updates', settings['icons']['ind-updates'])

    gsettings.set_string('color-ind-green', settings['colors']['ind-green'])
    gsettings.set_string('color-ind-normal', settings['colors']['ind-normal'])
    gsettings.set_string('color-ind-blink', settings['colors']['ind-blink'])
    gsettings.set_string('color-ind-dnd', settings['colors']['ind-dnd'])

    gsettings.set_string('color-label-dnd-on', settings['colors']['dnd-label-on'])
    gsettings.set_string('color-label-dnd-off', settings['colors']['dnd-label-off'])

    gsettings.set_string('color-label-menu-item-name', settings['colors']['menu-item-name'])
    gsettings.set_string('color-label-menu-item-status', settings['colors']['menu-item-status'])
    gsettings.set_string('color-label-menu-item-extra', settings['colors']['menu-item-extra'])

    gsettings.set_string('text-next-poll', settings['text']['next-poll'])
    gsettings.set_string('text-no-upd-avail', settings['text']['no-upd-avail'])
    gsettings.set_string('text-no-upd-status', settings['text']['no-upd-status'])
    gsettings.set_string('text-toggle-dnd', settings['text']['toggle-dnd'])

    gsettings.set_string('rules-path', settings['rules-path'])

    Gio.Settings.sync()


if __name__ == '__main__':
    wrapper = from_settings()
    print(json.dumps(wrapper, sort_keys=False))
