
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import { Button as PanelMenuButton } from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { PopupMenuItem } from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { IntervalAction } from './interval.js';


let _updates_list = [];

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
                const msg = _updates_list.length > 0 ? _updates_list.join(", ") : _('Everything is up to date.');

                Main.notify(subject, msg);
            });
            this.menu.addMenuItem(item);
        }

        get iconName() {
            return _updates_list.length === 0 ? 'selection-mode-symbolic' : 'software-update-available-symbolic';
        }

        get iconStateClass() {
            return _updates_list.length === 0 ? 'upd-indicator-icon-green' :
                this._blinkStateIsNormal ? 'upd-indicator-icon-normal' : 'upd-indicator-icon-blink';
        }

        iconBlink() {
            console.debug(`iconBlink: ${this._blinkStateIsNormal} ==> ${!this._blinkStateIsNormal}`);

            this._indicatorIcon.icon_name = this.iconName;

            this._blinkStateIsNormal = !this._blinkStateIsNormal;
            this._indicatorIcon.style_class = this.iconStateClass;
        }

        iconReset() {
            console.debug('iconReset: ');

            this._updates_list = [];
            this._blinkStateIsNormal = false;
            this.iconBlink();
        }

    });

const dummyUpdates = [
    'rpm-ostree status',
    'ublue-os url',
    'cpython#3.15',
    'brew',
    'sympy',
    'flatpak',
    'errors in dmesg'
];

function randomChoices(arr, num) {
    const rc = [];
    while (rc.length < num) {
        const potential = arr[Math.floor(Math.random() * num)];
        if (rc.includes(potential)) {
            continue;
        }

        rc.push(potential);
    }
    return rc;
}

function randomRuleAdaper() {
    // Decide whether or not to return updates
    if (Math.random() < 0.5) {
        return [false, []];
    }

    const numUpds = Math.floor(Math.random() * dummyUpdates.length);
    const choices = randomChoices(dummyUpdates, numUpds);
    if (choices.length === 0) {
        return [false, []];
    }

    return [true, choices.slice(0, numUpds)];
}

export default class UpdIndicatorExtension extends Extension {
    #blinkInterval = null;
    #monitorInterval = null;
    #indicator = null;

    get blinkRate() { return 5000 /* ms */; }

    get monitorRate() { return 15000 /* ms */; }

    _monitorAction() {
        console.log('upd-indicator - _monitorAction');

        const [updatesAvailable, updates] = randomRuleAdaper();
        _updates_list = updates;

        if (this.#blinkInterval.running) {
            console.log('upd-indicator - _monitorAction: already blinking ... re-checking updates');

            if (!updatesAvailable) {
                this.#blinkInterval.disable();
                this.#indicator.iconReset();
            }
        }
        else if (updatesAvailable) {
            console.log('upd-indicator - _monitorAction: found updates');
            this.#blinkInterval.enable();
        }
    }

    enable() {
        this.#indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this.#indicator);

        this.#blinkInterval = new IntervalAction('upd-indicator: blink - ', this.#indicator.iconBlink.bind(this.#indicator), this.blinkRate, 'secs blink rate');
        this.#blinkInterval.info();
        this.#monitorInterval = new IntervalAction('upd-indicator: monitor - ', this._monitorAction.bind(this), this.monitorRate, 'secs monitor rate');
        this.#monitorInterval.info();

        this.#monitorInterval.enable();
    }

    disable() {
        this.#monitorInterval.destroy();
        this.#blinkInterval.destroy();

        this.#indicator.iconReset();
        this.#indicator.destroy();
        this.#indicator = null;
    }
}
