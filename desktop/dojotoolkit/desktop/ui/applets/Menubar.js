dojo.provide("desktop.ui.applets.Menubar");
dojo.require("desktop.ui.applets.Menu");
dojo.require("dijit.Menu");
/*
 * Class: desktop.ui.applets.Menubar
 * 
 * An extention of desktop.ui.applets.Menu except it seperates the application, places, and system menus into their own buttons
 */
dojo.declare("desktop.ui.applets.Menubar", desktop.ui.applets.Menu, {
	dispName: "Menu Bar",
	/*
	 * Method: _makeSystemMenu
	 * 
	 * Makes the system menu
	 */
	_makeSystemMenu: function() {
		var m = new dijit.Menu();
		dojo.forEach([
			new dijit.PopupMenuItem({
				label: "Preferences",
				iconClass: "icon-16-categories-preferences-desktop",
				popup: this._makePrefsMenu()
			}),
			new dijit.MenuSeparator(),
			new dijit.MenuItem({
				label: "About Psych Desktop",
				iconClass: "icon-16-apps-help-browser",
				onClick: function() {
					api.ui.alertDialog({
						title: "About Psych Desktop",
						style: "width: 400px;",
						message: "<h2>Psych Desktop</h2><b>Version "+desktop.version+"</b><br /><br />Brought to you by:<ul style='padding: 0px;'><li>Will \"Psychcf\" Riley<div style=\"font-size: 10pt;\">Developer/Project Manager</div></li><li>Jay MacDonald<div style=\"font-size: 10pt;\">Developer/Assistant Project Manager</div></li><li>David \"mmx\" Clayton<div style=\"font-size: 10pt;\">UI Designer/Lead Artist</div></li></ul>"
					})
				}
			}),
			new dijit.MenuSeparator(),
			new dijit.MenuItem({
				label: "Log Out", 
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
		var m = new dijit.Menu();
		dojo.forEach([
			new dijit.MenuItem({
				label: "Home",
				iconClass: "icon-16-places-user-home",
				onClick: function() {
					desktop.app.launchHandler("/", {}, "text/directory");
				}
			}),
			new dijit.MenuItem({
				label: "Desktop",
				iconClass: "icon-16-places-user-desktop",
				onClick: function() {
					desktop.app.launchHandler("/Desktop/", {}, "text/directory");
				}
			})
		], m.addChild, m);
		return m;
	},
	/*
	 * Method: _drawButton
	 * 
	 * Draws the button for the applet
	 */
	_drawButton: function() {
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.form.Button");
		var tbar = new dijit.Toolbar();
		this.addChild(tbar);
		dojo.forEach([
			{
				iconClass: "icon-16-places-start-here",
				label: "Applications",
				dropDown: this._menu
			},
			{
				label: "Places",
				dropDown: this._makePlacesMenu()
			},
			{
				label: "System",
				dropDown: this._makeSystemMenu()
			}
		], function(i) {
			var b = new dijit.form.DropDownButton(i);
			tbar.addChild(b);
			b.domNode.style.height="100%";
			b.startup();
		});
	}
});
