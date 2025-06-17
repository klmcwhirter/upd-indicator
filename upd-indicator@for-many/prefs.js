import 'gi://Adw';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { debugLog } from './common-lib/log.js';
import { UpdIndicatorAboutPage } from './prefs-lib/about-page.js';

export default class UpdIndicatorPreferences extends ExtensionPreferences {
    /**
     * This class is constructed once when your extension preferences are
     * about to be opened. This is a good time to setup translations or anything
     * else you only do once.
     *
     * @param {ExtensionMeta} metadata - An extension meta object
     */
    constructor(metadata) {
        super(metadata);

        debugLog(`constructing ${this.metadata.name}`);
    }

    /**
     * Fill the preferences window with preferences.
     *
     * If this method is overridden, `getPreferencesWidget()` will NOT be called.
     *
     * @param {Adw.PreferencesWindow} window - the preferences window
     */
    fillPreferencesWindow(window) {
        const aboutPage = new UpdIndicatorAboutPage(this.metadata);
        window.add(aboutPage);
    }
}