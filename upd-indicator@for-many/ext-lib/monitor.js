import Gio from 'gi://Gio';

import { EventEmitter } from 'resource:///org/gnome/shell/misc/signals.js';

import { debugLog } from '../common-lib/log.js';
import { IntervalAction } from './interval.js';
import { pollingLocationAdapter } from './polling-adapter.js';


export class UpdatesMonitor extends EventEmitter {
    blinkInterval = null;
    monitorInterval = null;

    constructor({ ctx }) {
        super();

        this.ctx = ctx;

        this.displayName = ctx.displayName;
        this.blinkRate = ctx.blinkRate;
        this.monitorRate = ctx.monitorRate;
        this.doNotDisturb = ctx.doNotDisturbAtStart;

        this.textDecoder = new TextDecoder();
        this.cancellable = new Gio.Cancellable();

        this.updatesList = []; // do not emit change
        this._reset_dnd();
    }

    destroy() {
        if (this.cancellable && !this.cancellable.is_cancelled()) {
            this.cancellable.cancel();
        }

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

        const updates = pollingLocationAdapter(this.ctx.monitorLocation, this.textDecoder, this.cancellable);
        this.setUpdates(updates);

        if (this.blinkInterval.running) {
            debugLog(`${this.displayName} - _monitorAction: already blinking ... re-checking updates`);

            if (updates.length === 0) {
                this.blinkInterval.disable();
                this.emit('icon-reset');
            }
        }
        else if (updates.length > 0) {
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