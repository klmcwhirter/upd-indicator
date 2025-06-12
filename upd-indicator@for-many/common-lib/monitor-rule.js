import GLib from 'gi://GLib';

import { debugLog } from './log.js';

export class MonitorRule {
    name;
    description;
    enabled;
    command;
    notErrorCode;

    constructor({ name, description, enabled, command, notErrorCode }) {
        this.name = name;
        this.description = description;
        this.enabled = enabled;
        this.command = command;
        this.notErrorCode = notErrorCode;
    }

    /**
     * Parse the command for a @rule and return the array @argv
     * for use by execCommunicate.
     *
     * @param {MonitorRule} this - the rule being processed
     * @returns {string[]} - the argv array
     */
    parseCommand() {
        debugLog('parseCommand: rule.name=', this.name, 'rule.command=', this.command);
        // This function may throw an error
        const [, argv] = GLib.shell_parse_argv('nice --adjustment=20 ' + this.command);
        debugLog('parseCommand: argv=', argv);
        return argv;
    }
}
