dojo.provide("desktop.ui.applets.Menubar");
dojo.require("desktop.ui.applets.Menu");
dojo.require("dijit.Menu");
dojo.requireLocalization("desktop.ui", "menus");
dojo.requireLocalization("desktop", "places");
dojo.declare("desktop.ui.applets.Menubar", desktop.ui.applets.Menu, {
	//	summary:
	//		An extention of desktop.ui.applets.Menu except it seperates the application, places, and system menus into their own buttons
	dispName: "Menu Bar",
	_drawn: false,
	_drawButton: function() {
		//	summary:
		//		Draws the button for the applet
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
			if(i.label == l.system) {
				b.dropDown.addChild(new dijit.MenuSeparator());
				b.dropDown.addChild(new dijit.MenuItem({
					label: l.logOut, 
					iconClass: "icon-16-actions-system-log-out",
					onClick: desktop.user.logout
				}))
			}
		}, this);
	}
});
