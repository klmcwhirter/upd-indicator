
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
}
