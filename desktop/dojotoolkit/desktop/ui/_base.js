dojo.provide("desktop.ui._base");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.fx");
dojo.require("dijit.ColorPalette");
dojo.require("dojox.validate.web");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.form.Slider");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.Menu");
dojo.require("dojo.cookie");

dojo.require("desktop.ui._appletMoveable");
dojo.require("desktop.ui.Area");
dojo.require("desktop.ui.Applet");
dojo.require("desktop.ui.Credits");
dojo.require("desktop.ui.Panel");
dojo.require("desktop.ui.applets.Clock");
dojo.require("desktop.ui.applets.User");
dojo.require("desktop.ui.applets.Menu");
dojo.require("desktop.ui.applets.Menubar");
dojo.require("desktop.ui.applets.Netmonitor");
dojo.require("desktop.ui.applets.Separator");
dojo.require("desktop.ui.applets.Taskbar");
dojo.require("desktop.ui.applets.Twitter");
dojo.require("desktop.ui.applets.Quota");

dojo.requireLocalization("desktop.ui", "appearance");
dojo.requireLocalization("desktop.ui", "accountInfo");
dojo.requireLocalization("desktop", "languages");
dojo.requireLocalization("desktop", "common");

/*
 * Class: desktop.ui
 * 
 * Summary:
 * 		Draws core UI for the desktop such as panels and wallpaper
 */
dojo.mixin(desktop.ui, {
	//	_windowList: dojo.data.ItemFileWriteStore
	//		A dojo.data.ItemFileWriteStore containing a list of windows
	_windowList: new dojo.data.ItemFileWriteStore({
		data: {identifer: "id", items: []}
	}),
	//	_drawn: Boolean
	//		true after the UI has been drawn
	_drawn: false,
	_draw: function(){
		//	summary:
		//		creates a desktop.ui.Area widget and places it on the screen
		//		waits for the config to load so we can get the locale set right
		if(this._drawn === true) return;
		this._drawn = true;
		dojo.locale = desktop.config.locale;
		this._area = new desktop.ui.Area({});
		document.body.appendChild(desktop.ui._area.domNode);
		this._area.updateWallpaper();
		this.makePanels();
		dojo.subscribe("configApply", this, function(){
			this._area.updateWallpaper();
		});
	},
	init: function(){
		dojo.subscribe("configApply", this, function(){
			if(desktop.config.fx > 0) setTimeout(dojo.hitch(this, "_draw"), 100);
			else this._draw();
		});
		dojo.require("dojo.dnd.autoscroll");
		dojo.dnd.autoScroll = function(e){} //in order to prevent autoscrolling of the window
	},
	//	drawn: Boolean
	//		have the panels been drawn yet?
    drawn: false,
	makePanels: function(){
		//	summary:
		//		the first time it is called it draws each panel based on what's stored in the configuration,
		//		after that it cycles through each panel and calls it's _place(); method
        if(this.drawn){
	        dojo.query(".desktopPanel").forEach(function(panel){
		       var p = dijit.byNode(panel);
		       p._place();
	        }, this);
            return;
        }
        this.drawn = true;
        var panels = desktop.config.panels;
		dojo.forEach(panels, function(panel){
			var args = {
				thickness: panel.thickness,
				span: panel.span,
				placement: panel.placement,
				opacity: panel.opacity
			}
			var p = new desktop.ui.Panel(args);
			if(panel.locked) p.lock();
			else p.unlock();
			p.restore(panel.applets);
			desktop.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		});
		desktop.ui._area.resize();
	},
	save: function(){
		//	summary:
		//		Cylces through each panel and stores each panel's information in desktop.config
		//		so it can be restored during the next login
		desktop.config.panels = [];
		dojo.query(".desktopPanel").forEach(function(panel, i){
			var wid = dijit.byNode(panel);
			desktop.config.panels[i] = {
				thickness: wid.thickness,
				span: wid.span,
				locked: wid.locked,
				placement: wid.placement,
				opacity: wid.opacity,
				applets: wid.dump()
			}
		});
	},
	//	appletList: Object
	//		A object where the keys are applet categories, and their values are an array of applet names.
	//		These are used when showing the "Add to panel" dialog
	appletList: {
		"Accessories": ["Clock"],
		"Internet": ["Twitter"],
		"Desktop & Windows": ["Taskbar", "User"],
		"System": ["Netmonitor", "Quota"],
		"Utilities": ["Menu", "Menubar", "Separator"]
	}
});
