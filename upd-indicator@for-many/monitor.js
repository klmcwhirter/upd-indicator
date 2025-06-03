
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
