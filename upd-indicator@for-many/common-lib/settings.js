import { MonitorRule } from './monitor-rule.js';

export function from_settings(settings) {
    const ctx = {
        // contextual state used by the extension
        displayName: '',
        monitor: null,

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
    return ctx;
}
