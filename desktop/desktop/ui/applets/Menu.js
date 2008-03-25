dojo.provide("desktop.ui.applets.Menu");
dojo.require("dijit.Menu");
/*
 * Class: desktop.ui.applets.Menu
 * 
 * A simple menu applet
 */
dojo.declare("desktop.ui.applets.Menu", desktop.ui.Applet, {
	dispName: "Main Menu",
	postCreate: function() {
		this._getApps();
		//this._interval = setInterval(dojo.hitch(this, this._getApps), 1000*60);
		dojo.addClass(this.containerNode, "menuApplet");
		this.inherited("postCreate", arguments);
	},
	uninitialize: function() {
		//clearInterval(this._interval);
		if(this._menubutton) this._menubutton.destroy();
		if(this._menu) this._menu.destroy();
		this.inherited("uninitialize", arguments);
	},
	/*
	 * Method: _makePrefsMenu
	 * 
	 * Creates a preferences menu and returns it
	 */
	_makePrefsMenu: function() {
		var pMenu = new dijit.Menu();
		dojo.forEach([
			{
				label: "Appearance",
				iconClass: "icon-16-apps-preferences-desktop-theme",
				onClick: function() { desktop.ui.config.appearance(); }
			},
			{
				label: "Account Information",
				iconClass: "icon-16-apps-system-users",
				onClick: function() { desktop.ui.config.account(); }
			}
		], function(args) {
			pMenu.addChild(new dijit.MenuItem(args));
		});
		return pMenu;
	},
	/*
	 * Method: _drawButton
	 * 
	 * Creates a drop down button for the applet.
	 */
	_drawButton: function() {
		dojo.require("dijit.form.Button");
		if (this._menubutton) {
			this._menubutton.destroy();
		}
		this._menu.addChild(new dijit.PopupMenuItem({
			label: "Preferences",
			iconClass: "icon-16-categories-preferences-desktop",
			popup: this._makePrefsMenu()
		}))
		this._menu.addChild(new dijit.MenuItem({
			label: "Log Out", 
			iconClass: "icon-16-actions-system-log-out",
			onClick: desktop.user.logout
		}));
		var div = document.createElement("div");
		this.containerNode.appendChild(div);
		var b = new dijit.form.DropDownButton({
			iconClass: "icon-16-places-start-here",
			label: "Applications",
			showLabel: false,
			dropDown: this._menu
		}, div);
		dojo.addClass(b.domNode, "menuApplet");
		dojo.style(b.focusNode, "border", "0px");
		b.domNode.style.height="100%";
		b.startup();
		this._menubutton = b;
	},
	/*
	 * Method: _getApps
	 * 
	 * Gets the app list from the server and makes a menu for them
	 */
	_getApps: function() {
		api.xhr({
			backend: "core.app.fetch.list",
			load: dojo.hitch(this, function(data, ioArgs){
				data = dojo.fromJson(data);
				if (this._menu) {
					this._menu.destroy();
				}
				var menu = new dijit.Menu({});
				this._menu = menu;
				var cats = {};
				for(item in data)
				{
					cats[data[item].category] = true;
				}
				list = [];
				for(cat in cats)
				{
					list.push(cat);
				}
				list.sort();
				for(cat in list)
				{
					var cat = list[cat];
					//cat.meow();
					var category = new dijit.PopupMenuItem({iconClass: "icon-16-categories-applications-"+cat.toLowerCase(), label: cat});
					var catMenu = new dijit.Menu({parentMenu: category});
					for(app in data)
					{
						if(data[app].category == cat)
						{
							var item = new dijit.MenuItem({
								label: data[app].name
							});
							dojo.connect(item, "onClick", desktop.app, 
							new Function("desktop.app.launch("+data[app].id+")") );
							catMenu.addChild(item);
						}
					}
					catMenu.startup();
					category.popup = catMenu;
					menu.addChild(category);
				}
				menu.domNode.style.display="none";
				menu.startup();
				this._drawButton();
			})
		});
	}
});