import { debugLog } from './log.js';

const dummyUpdates = [
    { name: 'rpm-ostree status', status: 'rc != 77' },
    { name: 'cpython#3.14', status: 'behind' },
    { name: 'cpython#main', status: 'behind' },
    { name: 'brew', status: 'outdated' },
    { name: 'sympy', status: 'behind' },
    { name: 'flatpak remote-ls', status: 'updates' },
    { name: 'errors in dmesg', status: 'new' },
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

export const RANDOMRULEADAPTER_COMMAND = '@random';

export async function randomRuleAdapter(rules) {
    const enabled = rules.filter((rule) => rule.enabled && rule.command.includes(RANDOMRULEADAPTER_COMMAND));

    if (enabled.length === 0) {
        // supported rule not enabled
        debugLog('@random rule not enabled');
        return [false, []];
    }

    // Decide whether or not to return updates
    if (Math.random() < 0.35) {
        debugLog('opting for no updates');
        return [false, []];
    }

    const numUpds = Math.floor(Math.random() * dummyUpdates.length);
    const choices = randomChoices(dummyUpdates, numUpds);
    if (choices.length === 0) {
        debugLog('choices is empty', choices);
        return [false, []];
    }

    debugLog('choices is not empty', choices);
    return [true, choices.slice(0, numUpds)];
}
