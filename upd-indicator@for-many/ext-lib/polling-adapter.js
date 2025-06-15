import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { debugLog, errorLog } from '../common-lib/log.js';
import { UpdateItem } from '../common-lib/update-item.js';



/**
 * Read the contents of the file passed in as path.
 *
 * @param {string} path - full path of the file to read
 * @param {TextDecoder} textDecoder - decoder to use for bytes read from files
 * @returns {string} decoded contents of the file read or empty string if !ok
 */
function fileReadContents(path, textDecoder) {
    const [ok, bytes] = GLib.file_get_contents(path);
    if (ok) {
        return textDecoder.decode(bytes).trimEnd();
    }

    errorLog(`file_get_contents(${path}) returned ok=${ok}, bytes=${bytes}`);
    return '';
}

/**
 * Process the files at location and return any available updates
 *
 * @param {string} location - location at which to poll for *.json files
 * @param {TextDecoder} textDecoder - decoder to use for bytes read from files
 * @param {Gio.Cancellable} [cancellable] - optional cancellable object
 * @returns {UpdateItem[]} array of updates
 */
export function pollingLocationAdapter(location, textDecoder = new TextDecoder(), cancellable = null) {
    let items = [];

    // poll location for json files
    try {
        const directory = Gio.File.new_for_path(location);
        const iter = directory.enumerate_children(
            'standard::*',
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
            cancellable
        );
        const strs = [];
        for (const fileInfo of iter) {
            const name = fileInfo.get_name();
            const path = GLib.build_filenamev([location, name]);

            // validate type, file ext is json
            if (fileInfo.get_file_type() != Gio.FileType.REGULAR) {
                errorLog(`${path} is NOT a regular file; skipping...`);
                continue;
            }
            if (!name.endsWith('.json')) {
                errorLog(`${path} does NOT have a ".json" extension; skipping...`);
                continue;
            }

            debugLog(`reading ${path} ...`);
            const contents = fileReadContents(path, textDecoder);
            if (contents) {
                debugLog(`${path} => '${contents}'`);
                strs.push(contents);
            } else {
                errorLog(`${path} is empty; skipping...`);
                continue;
            }
        }
        debugLog(`strs=${strs}`);

        // Collect UpdateItem instances
        items = strs.flatMap(s => UpdateItem.arrayFromString(s));
    } catch (err) {
        errorLog('Error reading directory:', err);
    }
    debugLog('pollingRuleAdapter: items=', items);

    return items;
}
