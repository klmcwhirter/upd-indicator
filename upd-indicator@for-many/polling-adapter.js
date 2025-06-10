import Gio from 'gi://Gio';

import { debugLog, errorLog } from './log.js';
import { RANDOMRULEADAPTER_COMMAND } from './random-adapter.js';
import { UpdateItem } from './update-item.js';


/* https://gjs.guide/guides/gio/subprocesses.html */
Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

/* https://gjs.guide/guides/gjs/asynchronous-programming.html */

/**
 * Execute a command asynchronously (TODO) and return the output from `stdout` on
 * success or throw an error with output from `stderr` on failure.
 *
 * If given, @input will be passed to `stdin` and @cancellable can be used to
 * stop the process before it finishes.
 *
 * @param {MonitorRule} rule - name of the rule being processed
 * @param {string} [input] - Input to write to `stdin` or %null to ignore
 * @param {Gio.Cancellable} [cancellable] - optional cancellable object
 * @returns {UpdateItem[]} a list of updates parsed from the process stdout
 */
function execRuleCommand(rule, input = null, cancellable = null) {
    let cancelId = 0;

    try {
        let flags = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;

        if (input !== null) {
            flags |= Gio.SubprocessFlags.STDIN_PIPE;
        }
        const argv = rule.parseCommand();

        const proc = new Gio.Subprocess({ argv, flags });
        proc.init(cancellable);

        if (cancellable instanceof Gio.Cancellable) {
            cancelId = cancellable.connect(() => proc.force_exit());
        }

        // TODO refactor to use async - Promise API
        // eslint-disable-next-line no-unused-vars
        const [_ok, stdout, stderr] = proc.communicate_utf8(input, null);
        // const [stdout, stderr] = await proc.communicate_utf8_async(input, null);

        const status = proc.get_exit_status();

        const msg = `execRuleCommand: name=${rule.name}, command='${argv}'\nstderr=${stderr ? stderr.trim() : stderr}\nstdout=${stdout ? stdout.trim() : stdout}\n`;

        if (status !== rule.notErrorCode) {
            throw new Gio.IOErrorEnum({
                code: Gio.IOErrorEnum.FAILED,
                message: `${msg}failed with exit code ${status} !== rule.notErrorCode=${rule.notErrorCode}\n\n`,
            });
        }

        debugLog(msg);
        const objsIn = stdout.trim();
        return objsIn ? UpdateItem.arrayFromString(objsIn) : [];
    } finally {
        if (cancelId > 0) {
            cancellable.disconnect(cancelId);
        }
    }
}

/**
 * Given the array of @rules for each one, execute the command, and
 * return UpdateItem(s) for the output as collected
 *
 * @param {MonitorRule[]} rules - the rules configured
 * @param {Gio.Cancellable} [cancellable] - optional cancellable object
 * @returns {UpdateItem[]} array of updates
 */
function pollingUpdateItems(rules, cancellable = null) {
    const updates = rules.map((rule) => {
        try {
            return execRuleCommand(rule, null, cancellable);
        } catch (err) {
            errorLog(err);
        }
    });

    const items = updates.flat();
    return items;
}

/**
 * Given the array of @rules return true if this adapter can process at least one of them.
 *
 * @param {MonitorRule[]} rules - the rules configured
 * @returns {MonitorRule[]} filtered rules array
 */
function pollingRuleAdapterFiltered(rules) {
    return rules.filter((rule) => rule.enabled && rule.command !== RANDOMRULEADAPTER_COMMAND);
}

/**
 * Filter the array of @rules and return the rules that are enabled.
 *
 * @param {MonitorRule[]} rules - the rules configured
 * @returns {boolean} true if this adapter can process any of the rules
 */
export function pollingRuleAdapterCanProcess(rules) {
    return pollingRuleAdapterFiltered(rules).length > 0;
}

/**
 * Process the array of @rules and return any available updates
 *
 * @param {MonitorRule[]} rules - the rules configured
 * @param {Gio.Cancellable} [cancellable] - optional cancellable object
 * @returns {[boolean, UpdateItem[]]} true if updates are available, the updates array
 */
export function pollingRuleAdapter(rules, cancellable = null) {
    if (!pollingRuleAdapterCanProcess(rules)) {
        // supported rule not enabled
        debugLog('pollingRuleAdapter: no rules enabled');
        return [];
    }

    const filteredRules = pollingRuleAdapterFiltered(rules);
    const items = pollingUpdateItems(filteredRules, cancellable);
    debugLog('pollingRuleAdapter: items=', items);

    return items;
}
