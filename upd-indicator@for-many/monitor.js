
import { EventEmitter } from 'resource:///org/gnome/shell/misc/signals.js';
import { IntervalAction } from './interval.js';
import { debugLog } from './log.js';
import { randomRuleAdapter } from './random-rule.js';

export class MonitorRule {
    name;
    description;
    enabled;
    command;
    extraInfo;

    constructor({ name, description, enabled, command, extraInfo }) {
        this.name = name;
        this.description = description;
        this.enabled = enabled;
        this.command = command;
        this.extraInfo = extraInfo;
    }

    /* TODO: save prefs */
}


export class UpdatesMonitor extends EventEmitter {
    blinkInterval = null;
    monitorInterval = null;

    constructor({ ctx }) {
        super();

        this.displayName = ctx.displayName;
        this.rules = ctx.rules.filter((u) => u.enabled);  // only want enabled rules
        this.blinkRate = ctx.blinkRate;
        this.monitorRate = ctx.monitorRate;

        this.doNotDisturb = ctx.doNotDisturbAtStart;

        this.updatesList = []; // do not emit change
        this._reset_dnd();
    }

    destroy() {
        if (this.monitorInterval instanceof IntervalAction) {
            this.monitorInterval.destroy();
            delete this.monitorInterval;
        }

        if (this.blinkInterval instanceof IntervalAction) {
            this.blinkInterval.destroy();
            delete this.blinkInterval;
        }
    }

    setUpdates(newArr) {
        this.updatesList = [...newArr];
        this.emit('updates-list-updated', this.updates);
    }

    updates() {
        return [...this.updatesList];
    }

    updatesEmpty() {
        return this.updatesList === undefined || this.updatesList === null || this.updatesList.length === 0;
    }

    _monitorAction() {
        debugLog(`${this.displayName} - _monitorAction`);

        const [updatesAvailable, updates] = randomRuleAdapter(this.rules);
        this.setUpdates(updates);

        if (this.blinkInterval.running) {
            debugLog(`${this.displayName} - _monitorAction: already blinking ... re-checking updates`);

            if (!updatesAvailable) {
                this.blinkInterval.disable();
                this.emit('icon-reset');
            }
        }
        else if (updatesAvailable) {
            debugLog(`${this.displayName} - _monitorAction: found updates`);
            this.blinkInterval.enable();
        }
    }

    _reset_dnd() {
        if (this.doNotDisturb) {
            this.blinkInterval.disable();
            this.monitorInterval.disable();
            this.emit('dnd-set');
        } else {
            this.emit('dnd-clear');

            if (!(this.blinkInterval instanceof IntervalAction)) {
                this.blinkInterval = new IntervalAction({
                    logText: `${this.displayName}: blink - `,
                    actionFunc: () => this.emit('icon-blink'),
                    rate: this.blinkRate,
                    rateDesc: 'secs blink rate',
                });
            }
            this.blinkInterval.info();

            if (!(this.monitorInterval instanceof IntervalAction)) {
                this.monitorInterval = new IntervalAction({
                    logText: `${this.displayName}: monitor - `,
                    actionFunc: this._monitorAction.bind(this),
                    rate: this.monitorRate,
                    rateDesc: 'secs monitor rate',
                });
            }
            this.monitorInterval.info();

            this.monitorInterval.enable();
        }
    }

    toggleDoNotDisturb() {
        debugLog(`${this.displayName} - toggleDoNotDisturb`);
        this.doNotDisturb = !this.doNotDisturb;

        this._reset_dnd();
    }
}