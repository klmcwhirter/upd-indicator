
const DEBUG = true;

export function debugLog(...rest) {
    if (DEBUG) {
        infoLog(...rest);
    }
}

export function infoLog(...rest) {
    console.log(...rest);
}
