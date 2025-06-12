
const DEBUG = false;

export function debugLog(...rest) {
    if (DEBUG) {
        infoLog(...rest);
    }
}

export function errorLog(...rest) {
    console.error(...rest);
}

export function infoLog(...rest) {
    console.log(...rest);
}
