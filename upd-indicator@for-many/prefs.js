
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
// import Gio from 'gi://Gio';
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import * as Config from 'resource:///org/gnome/Shell/Extensions/js/misc/config.js';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { debugLog } from './common-lib/log.js';

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

// Create the About page
export const UpdIndicatorAboutPage = GObject.registerClass(class UpdIndicatorAboutPage extends Adw.PreferencesPage {
    _init(metadata) {
        super._init({
            title: _('About'),
            icon_name: 'help-about-symbolic',
        });

        const EXTERNAL_LINK_ICON = 'adw-external-link-symbolic'

        const aboutGroup = new Adw.PreferencesGroup();
        const aboutBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 10,
            margin_bottom: 10,
            hexpand: false,
            vexpand: false,
        });

        const projectDescriptionLabel = new Gtk.Label({
            label: metadata['description'],
            hexpand: false,
            vexpand: false,
            margin_bottom: 5,
        });

        aboutBox.append(projectDescriptionLabel);
        aboutGroup.add(aboutBox);

        this.add(aboutGroup);

        const extensionInfoGroup = new Adw.PreferencesGroup();
        const updIndVersionRow = new Adw.ActionRow({
            title: _('Update Indicator Version'),
        });
        let releaseVersion;
        if (metadata['version-name'])
            releaseVersion = metadata['version-name'];
        else
            releaseVersion = 'unknown';
        updIndVersionRow.add_suffix(new Gtk.Label({
            label: `${releaseVersion}`,
        }));

        const gnomeVersionRow = new Adw.ActionRow({
            title: _('GNOME Version'),
        });
        gnomeVersionRow.add_suffix(new Gtk.Label({
            label: `${Config.PACKAGE_VERSION.toString()}`,
        }));

        const createdByRow = new Adw.ActionRow({
            title: _('Created by'),
        });
        createdByRow.add_suffix(new Gtk.Label({
            label: 'klmcwhirter',
        }));

        const githubLinkRow = new Adw.ActionRow({
            title: 'GitHub',
        });
        githubLinkRow.add_suffix(new Gtk.LinkButton({
            icon_name: EXTERNAL_LINK_ICON,
            uri: 'https://github.com/klmcwhirter/upd-indicator',
        }));

        const contributorRow = new Adw.ActionRow({
            title: _('Contributors'),
        });
        contributorRow.add_suffix(new Gtk.LinkButton({
            icon_name: EXTERNAL_LINK_ICON,
            uri: 'https://github.com/klmcwhirter/upd-indicator/graphs/contributors'
        }));


        const donationsRow = new Adw.ActionRow({
            title: _('Donations'),
        });
        donationsRow.add_suffix(new Gtk.Label({
            label: metadata['donations']['custom']
        }));

        extensionInfoGroup.add(updIndVersionRow);
        extensionInfoGroup.add(gnomeVersionRow);
        extensionInfoGroup.add(createdByRow);
        extensionInfoGroup.add(githubLinkRow);
        extensionInfoGroup.add(contributorRow);
        extensionInfoGroup.add(donationsRow);

        this.add(extensionInfoGroup);


        const warrantyLabel = _('This program comes with absolutely no warranty.');
        const urlLabel = _('See the %sMIT License%s for details.').format('<a href="https://raw.githubusercontent.com/klmcwhirter/upd-indicator/refs/heads/main/LICENSE">', '</a>');

        const mitSoftwareGroup = new Adw.PreferencesGroup();
        const mitSofwareLabel = new Gtk.Label({
            label: `<span size="small">${warrantyLabel}\n${urlLabel}</span>`,
            use_markup: true,
            justify: Gtk.Justification.CENTER,
        });

        const mitSofwareLabelBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.END,
            vexpand: true,
            margin_top: 5,
            margin_bottom: 10,
        });
        mitSofwareLabelBox.append(mitSofwareLabel);
        mitSoftwareGroup.add(mitSofwareLabelBox);
        this.add(mitSoftwareGroup);
    }
});
