
import GObject from 'gi://GObject';
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import { Button as PanelMenuButton } from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { PopupMenuItem } from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { IntervalAction } from './interval.js';
import { debugLog, infoLog } from './log.js';
import { MonitorRule } from './monitor.js';
import { randomRuleAdapter } from './random-rule.js';

let _updates_list = [];
let _doNotDisturb = false;
let _dndResolver;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenuButton {
        _blinkStateIsNormal;

        _init() {
            super._init(0.0, _('Update Indicator'));

            this._blinkStateIsNormal = true;

            this._indicatorIcon = new St.Icon({
                icon_name: this.iconName,
                style_class: this.iconStateClass
            });

            this.add_child(this._indicatorIcon);


            let item = new PopupMenuItem(_('Show Updates'));
            item.connect('activate', () => {
                const subject = _updates_list.length > 0 ? _('Update(s) Available') : _('No Updates Available');
                const msg = _updates_list.length > 0 ? _updates_list.map((u) => u.name).join(", ") : _('Everything is up to date.');

                Main.notify(subject, msg);
            });
            this.menu.addMenuItem(item);


            let dnd = new PopupMenuItem(_('Toggle Do Not Disturb'));
            dnd.connect('activate', () => {
                _dndResolver();
                this.iconReset();
            });
            this.menu.addMenuItem(dnd);

            setTimeout(_dndResolver, 1500); // toggle dnd now
        }

        get iconName() {
            return _doNotDisturb ? 'system-shutdown-symbolic' :
                _updates_list.length === 0 ? 'selection-mode-symbolic' : 'software-update-available-symbolic';
        }

        get iconStateClass() {
            return _doNotDisturb ? 'upd-indicator-icon-normal' :
                _updates_list.length === 0 ? 'upd-indicator-icon-green' :
                    this._blinkStateIsNormal ? 'upd-indicator-icon-normal' : 'upd-indicator-icon-blink';
        }

        iconBlink() {
            debugLog(`iconBlink: _blinkStateIsNormal=${this._blinkStateIsNormal}`);

            this._indicatorIcon.icon_name = this.iconName;

            this._blinkStateIsNormal = !this._blinkStateIsNormal;
            this._indicatorIcon.style_class = this.iconStateClass;
        }

        iconReset() {
            debugLog('iconReset: ');

            _updates_list = [];
            this._blinkStateIsNormal = true;
            this.iconBlink();
        }

    });

export default class UpdIndicatorExtension extends Extension {
    #blinkInterval = null;
    #monitorInterval = null;
    #indicator = null;
    #displayName;

    // "settings-schema": "org.gnome.shell.extensions.upd-indicator"

    get blinkRate() { return 5000 /* ms */; }

    get monitorRate() { return 15000 /* ms */; }

    get enabledRules() {
        return this.rules.filter((rule) => rule.enabled);
    }

    get rules() {
        return [
            // TODO - these will come from prefs
            new MonitorRule({
                name: 'random',
                description: 'random number of hard-coded strings',
                enabled: true,
                command: '@random',
                extraInfo: 'Some updates to check out'
            })
        ];
    }

    get ruleMonitor() { return randomRuleAdapter; }

    _reset_dnd(indicator) {
        if (_doNotDisturb) {
            this.#blinkInterval.disable();
            this.#monitorInterval.disable();
        } else {
            if (!(this.#blinkInterval instanceof IntervalAction)) {
                this.#blinkInterval = new IntervalAction({
                    logText: `${this.#displayName}: blink - `,
                    actionFunc: indicator.iconBlink.bind(indicator),
                    rate: this.blinkRate,
                    rateDesc: 'secs blink rate',
                });
            }
            this.#blinkInterval.info();

            if (!(this.#monitorInterval instanceof IntervalAction)) {
                this.#monitorInterval = new IntervalAction({
                    logText: `${this.#displayName}: monitor - `,
                    actionFunc: this._monitorAction.bind(this),
                    rate: this.monitorRate,
                    rateDesc: 'secs monitor rate',
                });
            }
            this.#monitorInterval.info();

            this.#monitorInterval.enable();
        }
    }

    _toggle_do_not_disturb() {
        debugLog(`${this.#displayName} - _toggle_do_not_disturb`);
        _doNotDisturb = !_doNotDisturb;
        this._reset_dnd(this.#indicator);
    }

    async _monitorAction() {
        debugLog(`${this.#displayName} - _monitorAction`);

        const [updatesAvailable, updates] = await this.ruleMonitor(this.enabledRules);
        _updates_list = [...updates];

        if (this.#blinkInterval.running) {
            debugLog(`${this.#displayName} - _monitorAction: already blinking ... re-checking updates`);

            if (!updatesAvailable) {
                this.#blinkInterval.disable();
                this.#indicator.iconReset();
            }
        }
        else if (updatesAvailable) {
            debugLog(`${this.#displayName} - _monitorAction: found updates`);
            this.#indicator._blinkStateIsNormal = true;
            this.#blinkInterval.enable();
        }
    }

    enable() {
        this.#displayName = this.metadata.uuid.split('@')[0];
        _doNotDisturb = true; // while starting
        _dndResolver = this._toggle_do_not_disturb.bind(this);

        infoLog(`${this.#displayName} is starting ...`);

        this.#indicator = new Indicator();
        this.#indicator._blinkStateIsNormal = true;
        Main.panel.addToStatusArea(this.uuid, this.#indicator);

        infoLog(`${this.#displayName} is starting ... done.`);
    }

    disable() {
        infoLog(`${this.#displayName} is stopping ...`);

        this.#monitorInterval.destroy();
        this.#blinkInterval.destroy();

        this.#indicator.iconReset();
        this.#indicator.destroy();
        this.#indicator = null;

        infoLog(`${this.#displayName} is stopping ... done.`);
    }
}
