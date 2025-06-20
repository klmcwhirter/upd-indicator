import { infoLog } from '../common-lib/log.js';

export class IntervalAction {
    #interval = null;
    #logText;
    #actionFunc;
    #rate;
    #rateDesc;

    constructor({ logText, actionFunc, rate, rateDesc }) {
        this.#logText = logText;
        this.#actionFunc = actionFunc;
        this.#rate = rate;
        this.#rateDesc = rateDesc;
    }

    destroy() {
        this.disable();
    }

    get running() {
        return this.#interval !== null;
    }

    info() {
        infoLog(`${this.#logText} interval defined with ${this.#rate / 1000} ${this.#rateDesc}`);
    }

    enable() {
        if (!this.running) {
            infoLog(`${this.#logText} starting interval with ${this.#rate / 1000} ${this.#rateDesc}`);

            this.#actionFunc();  // invoke once before starting interval
            this.#interval = setInterval(this.#actionFunc, this.#rate);
        }
    }

    disable() {
        if (this.running) {
            infoLog(`${this.#logText} stopping interval`);
            clearInterval(this.#interval);
            this.#interval = null;
        }
    }
}
