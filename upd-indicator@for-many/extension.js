import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';


import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';


import { debugLog, errorLog, infoLog } from './common-lib/log.js';
import { from_settings } from './common-lib/settings.js';
import { UpdateItem } from './common-lib/update-item.js';
import { UpdatesMonitor } from './ext-lib/monitor.js';

function colorStyle(colors, colorKey) {
    const extra = colorKey === 'menu-item-name' ? 'font-weight: bold;' : '';
    return `color: ${colors[colorKey]};${extra}`;
}

class UpdatesMenuItem extends PopupMenu.PopupBaseMenuItem {
    static {
        GObject.registerClass(this);
    }

    constructor(update, colors) {
        super(update.name, {
            activate: false,
            // reactive: false,
            can_focus: false,
            style_class: 'popup-menu-item',
            update: update,
            colors: colors
        });
        // this.sensitive = false;
    }

    _init(_text, params) {
        debugLog('UpdatesMenuItem._init: params=', params);

        const update = params.update;
        delete params.update;
        const colors = params.colors;
        delete params.colors;

        super._init(params);

        this.box = new St.BoxLayout({
            orientation: Clutter.Orientation.HORIZONTAL
        });

        const props = ['name', 'status', 'extra']
        props.forEach((prop) => {
            if (prop in update && update[prop] !== null && update[prop] !== undefined) {
                let label = new St.Label({
                    text: update[prop],
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER,
                    x_expand: true,
                    x_align: Clutter.ActorAlign.START,
                    margin_left: 3,
                    margin_right: 3,
                    width: 200,
                    style: colorStyle(colors, `menu-item-${prop}`)
                });
                label.clutter_text.set_line_wrap(true);
                this.box.add_child(label);
            }
        });

        this.add_child(this.box);
        this.label_actor = this.box;
    }
}

class UpdatesMenu extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor({ ctx }) {
        super({ ctx: ctx });
    }

    _init({ ctx }) {
        super._init(0.0, 'Update Indicator');
        this.ctx = ctx;

        this.monitor = this.ctx.monitor;

        this.blinkStateIsNormal = true;
        this.doNotDisturb = ctx.doNotDisturbAtStart;

        this.indicatorIcon = new St.Icon({
            icon_name: this.iconName,
            style_class: 'panel-button-icon'
        });

        this.add_child(this.indicatorIcon);

        this._create();

        this.monitor.connect('icon-blink', () => this.iconBlink());
        this.monitor.connect('icon-reset', () => this.iconReset());
        this.monitor.connect('dnd-clear', () => { this.doNotDisturb = false; this._setColors(); });
        this.monitor.connect('dnd-set', () => { this.doNotDisturb = true; this._setColors(); });
        this.monitor.connect('set-next-poll', () => { this.nextPollItem.label.set_text(this.nextPoll); });
        this.monitor.connect('updates-list-updated', () => this._rebuildDisplay());
    }

    destroy() {
        super.destroy();
    }

    get dndColorKey() {
        return this.doNotDisturb ? 'dnd-label-on' : 'dnd-label-off';
    }

    get iconName() {
        return this.monitor.updatesEmpty() ? this.ctx.icons['ind-green'] : this.ctx.icons['ind-updates'];
    }

    get iconStyleColorKey() {
        return this.doNotDisturb ? 'ind-dnd' :
            this.monitor.updatesEmpty() ? 'ind-green' :
                this.blinkStateIsNormal ? 'ind-normal' : 'ind-blink';
    }

    get nextPoll() { return `Next Poll: ${(new Date(Date.now() + this.ctx.monitorRate)).toLocaleString()}`; }

    _create() {
        this.indicatorIcon.icon_name = this.iconName;

        this.dnd = new PopupMenu.PopupMenuItem(this.ctx.text['toggle-dnd']);
        this.dnd.connect('activate', () => {
            this.monitor.toggleDoNotDisturb();
            this.iconReset();
        });
        this.menu.addMenuItem(this.dnd);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.nextPollItem = new PopupMenu.PopupMenuItem(this.nextPoll, { reactive: false });
        this.menu.addMenuItem(this.nextPollItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const updatesList = this.monitor.updates();
        debugLog('UpdatesMenu._create: updatesList=', updatesList);

        if (updatesList.length > 0) {
            updatesList.forEach((u) => {
                const updateItem = new UpdatesMenuItem(u, this.ctx.colors);
                this.menu.addMenuItem(updateItem);
            });
        } else {
            const updateItem = new UpdatesMenuItem(
                new UpdateItem({
                    name: this.ctx.text['no-upd-avail'],
                    status: this.ctx.text['no-upd-status']
                }),
                this.ctx.colors
            );
            this.menu.addMenuItem(updateItem);
        }

        this._setColors();
    }

    _rebuildDisplay() {
        this.menu.removeAll();
        this._create();
    }

    _setColors() {
        const colors = this.ctx.colors;
        const extra = 'font-weight: bold;';
        this.dnd.label.style = `${colorStyle(colors, this.dndColorKey)}${extra}`;
        this.indicatorIcon.style = colorStyle(colors, this.iconStyleColorKey);
    }

    iconBlink() {
        debugLog(`iconBlink: blinkStateIsNormal=${this.blinkStateIsNormal}`);
        this.blinkStateIsNormal = !this.blinkStateIsNormal;

        this.indicatorIcon.icon_name = this.iconName;

        this._setColors();
    }

    iconReset() {
        debugLog('iconReset: ');

        // this.monitor.setUpdates([]);

        this.blinkStateIsNormal = true;
        this.iconBlink();
    }

}

export default class UpdIndicatorExtension extends Extension {
    monitor = null;
    menu = null;

    enable() {
        this.displayName = this.metadata.uuid.split('@')[0];
        this.setttings = this.getSettings();

        const ctx = from_settings(this.setttings);
        ctx.displayName = this.displayName;
        debugLog(`ctx=`, ctx);

        infoLog(`${this.displayName} is starting ...`);

        try {
            this.monitor = new UpdatesMonitor({ ctx: ctx });
            ctx.monitor = this.monitor;

            this.menu = new UpdatesMenu({ ctx: ctx });
            Main.panel.addToStatusArea(this.uuid, this.menu);
        } catch (err) {
            this.stop = true;
            errorLog(`Error initializing: `, err);
        }

        infoLog(`${this.displayName} is starting ... done.`);

        if (this.stop) {
            this.disable();
        }
    }

    disable() {
        infoLog(`${this.displayName} is stopping ...`);

        if (this.monitor instanceof UpdatesMonitor) {
            this.monitor.destroy();
            delete this.monitor;
        }

        if (this.menu instanceof UpdatesMenu) {
            this.menu.destroy();
            delete this.menu;
        }

        this.setttings = null;

        infoLog(`${this.displayName} is stopping ... done.`);
    }
}
