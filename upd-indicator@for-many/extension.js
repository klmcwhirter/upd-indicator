
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

let _updates_list = [];

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _blinkStateIsNormal;

        _init() {
            super._init(0.0, _('Update Indicator'));

            this._blinkStateIsNormal = true;

            this._indicatorIcon = new St.Icon({
                icon_name: this.iconName,
                style_class: this.iconStateClass
            });

            this.add_child(this._indicatorIcon);

            let item = new PopupMenu.PopupMenuItem(_('Show Updates'));
            item.connect('activate', () => {
                const subject = _updates_list.length > 0 ? _('Update(s) available') : _('No updates available.');
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

            this._blinkStateIsNormal = false;
            this.iconBlink();
            this._updates_list = [];
        }

    });

class IntervalAction {
    #interval = null;
    #logText;
    #actionFunc;
    #rate;
    #rateDesc;

    constructor(logText, actionFunc, rate, rateDesc) {
        this.#logText = logText;
        this.#actionFunc = actionFunc;
        this.#rate = rate;
        this.#rateDesc = rateDesc;
    }

    destroy() {
        if (this.#interval !== null) {
            clearInterval(this.#interval);
            this.#interval = null;
        }
    }

    get running() {
        return this.#interval !== null;
    }

    info() {
        console.log(`${this.#logText} interval defined with ${this.#rate / 1000} ${this.#rateDesc}`);
    }

    start() {
        if (!this.running) {
            console.log(`${this.#logText} starting interval with ${this.#rate / 1000} ${this.#rateDesc}`);

            this.#actionFunc(); // run 1 time before the delay

            this.#interval = setInterval(this.#actionFunc, this.#rate);
        }
    }

    stop() {
        if (this.running) {
            console.log(`${this.#logText} stopping interval`);
            clearInterval(this.#interval);
            this.#interval = null;
        }
    }
}

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
        _updates_list = [];
        return false;
    }

    const numUpds = Math.floor(Math.random() * dummyUpdates.length);
    const choices = randomChoices(dummyUpdates, numUpds);
    if (choices.length === 0) {
        _updates_list = [];
        return false;
    }
    _updates_list = choices.slice(0, numUpds);  // .join(",\n ");
    return true;
}

export default class IndicatorExampleExtension extends Extension {
    #blinkInterval = null;
    #monitorInterval = null;
    #indicator = null;

    get blinkRate() { return 5000 /* ms */; }

    get monitorRate() { return 15000 /* ms */; }

    _monitorAction() {
        console.log('upd-indicator - _monitorAction');

        const updatesAvailable = randomRuleAdaper();

        if (this.#blinkInterval.running) {
            console.log('upd-indicator - _monitorAction: already blinking ... re-checking updates');

            if (!updatesAvailable) {
                this.#blinkInterval.stop();
                this.#indicator.iconReset();
            }
        }
        else if (updatesAvailable) {
            console.log('upd-indicator - _monitorAction: found updates');
            this.#blinkInterval.start();
        }
    }

    enable() {
        this.#indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this.#indicator);

        this.#blinkInterval = new IntervalAction('upd-indicator: blink - ', this.#indicator.iconBlink.bind(this.#indicator), this.blinkRate, 'secs blink rate');
        this.#blinkInterval.info();
        this.#monitorInterval = new IntervalAction('upd-indicator: monitor - ', this._monitorAction.bind(this), this.monitorRate, 'secs monitor rate');
        this.#monitorInterval.info();

        this.#monitorInterval.start();
    }

    disable() {
        this.#monitorInterval.destroy();
        this.#blinkInterval.destroy();

        this.#indicator.iconReset();
        this.#indicator.destroy();
        this.#indicator = null;
    }
}
