dojo.provide("desktop.ui.applets.Menubar");
dojo.require("desktop.ui.applets.Menu");
dojo.require("dijit.Menu");
dojo.requireLocalization("desktop.ui", "menus");
dojo.requireLocalization("desktop", "places");
/*
 * Class: desktop.ui.applets.Menubar
 * 
 * An extention of desktop.ui.applets.Menu except it seperates the application, places, and system menus into their own buttons
 */
dojo.declare("desktop.ui.applets.Menubar", desktop.ui.applets.Menu, {
	dispName: "Menu Bar",
	_drawn: false,
	/*
	 * Method: _makeSystemMenu
	 * 
	 * Makes the system menu
	 */
	_makeSystemMenu: function() {
		var l = dojo.i18n.getLocalization("desktop.ui", "menus");
		var m = new dijit.Menu();
		dojo.forEach([
			new dijit.PopupMenuItem({
				label: l.preferences,
				iconClass: "icon-16-categories-preferences-desktop",
				popup: this._makePrefsMenu()
			}),
			new dijit.MenuSeparator(),
			new dijit.MenuItem({
				label: l.about,
				iconClass: "icon-16-apps-help-browser",
				onClick: function() {
					api.ui.alertDialog({
						title: l.about,
						style: "width: 400px;",
						message: "<h2>Psych Desktop</h2><b>Version "+desktop.version+"</b><br /><br />Brought to you by:<ul style='padding: 0px; height: 250px; overflow-y: auto;'><li>Will \"Psychcf\" Riley<div style=\"font-size: 10pt;\">Developer/Project Manager</div></li><li>Jay MacDonald<div style=\"font-size: 10pt;\">Developer/Assistant Project Manager</div></li><li>David \"mmx\" Clayton<div style=\"font-size: 10pt;\">UI Designer/Lead Artist</div></li><li>nefariousD<div style=\"font-size: 10pt;\">Community Contributor</div></li></ul>"
					})
				}
			}),
			new dijit.MenuSeparator(),
			new dijit.MenuItem({
				label: l.logOut, 
				iconClass: "icon-16-actions-system-log-out",
				onClick: desktop.user.logout
			})
		], m.addChild, m);
		return m;
	},
	/*
	 * Method: _makePlacesMenu
	 * 
	 * Makes the places menu
	 */
	_makePlacesMenu: function() {
		var l = dojo.i18n.getLocalization("desktop", "places");
		var m = new dijit.Menu();
		dojo.forEach(desktop.config.filesystem.places, function(place) {
			var item = new dijit.MenuItem({label: l[place.name] || place.name,
				iconClass: place.icon || "icon-16-places-folder",
				onClick: function() { desktop.app.launchHandler(place.path, {}, "text/directory"); }
			});
			m.addChild(item);
		}, this);
		return m;
	},
	/*
	 * Method: _drawButton
	 * 
	 * Draws the button for the applet
	 */
	_drawButton: function() {
		var l = dojo.i18n.getLocalization("desktop.ui", "menus");
		if(this._drawn) {
			this._appMenuButton.dropDown = this._menu;
			this._appMenuButton._started = false; //hackish....
			this._appMenuButton.startup();
			return;
		}
		else this._drawn = true;
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.form.Button");
		var tbar = new dijit.Toolbar();
		this.addChild(tbar);
		dojo.forEach([
			{
				iconClass: "icon-16-places-start-here",
				label: l.applications,
				dropDown: this._menu
			},
			{
				label: l.places,
				dropDown: this._makePlacesMenu()
			},
			{
				label: l.system,
				dropDown: this._makeSystemMenu()
			}
		], function(i) {
			var b = new dijit.form.DropDownButton(i);
			tbar.addChild(b);
			b.domNode.style.height="100%";
			b.startup();
			if(i.label == l.applications) this._appMenuButton = b;
		}, this);
	}
});
