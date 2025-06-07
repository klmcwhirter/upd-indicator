import { errorLog } from './log.js';

export class UpdateItem {
    name;
    status;
    extra;

    constructor({ name, status, extra }) {
        this.name = name;
        this.status = status;
        if (extra !== undefined) {
            this.extra = extra;
        }
    }

    static arrayFromString(str) {
        try {
            const objs = JSON.parse(str);
            return objs.map((o) => new UpdateItem(o));
        } catch (err) {
            errorLog('UpdateItem.arrayFromString: ERROR=', err);
        }
        return [];
    }
}
