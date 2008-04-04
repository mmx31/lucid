dojo.provide("desktop.ui.Area");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.Menu");
dojo.requireLocalization("desktop.ui", "appearance");
/*
 * 
 * Class: desktop.ui.Area
 *  
 * Summary:
 * 		the main UI area of the desktop. This is where panels, wallpaper, and most other things are drawn.
 */
dojo.declare("desktop.ui.Area", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"uiArea\"><div dojoAttachPoint=\"containerNode\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10;\"></div><div dojoAttachPoint=\"wallpaperNode\" class=\"wallpaper\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1;\"></div></div>",
	drawn: false,
	postCreate: function() {
		var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
		var filearea = this.filearea = new api.Filearea({path: "file://Desktop/", forDesktop: true, subdirs: false, style: "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;", overflow: "hidden"});
		dojo.addClass(filearea.domNode, "mainFileArea");
		filearea.menu.addChild(new dijit.MenuSeparator({}));
		filearea.menu.addChild(new dijit.MenuItem({label: l.wallpaper, iconClass: "icon-16-apps-preferences-desktop-wallpaper", onClick: dojo.hitch(desktop.ui.config, "appearance")}));
		filearea.refresh();
		dojo.style(filearea.domNode, "zIndex", 1);
		this.containerNode.appendChild(filearea.domNode);
		
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"resize");
		}
		dojo.connect(window,'onresize',this,"resize");
	},
	/*
	 * Method: getBox
	 * 
	 * gets the ammount of space the panels are taking up on each side of the screen.
	 * Used to calculate the size of the windows when maximized.
	 */
	getBox: function() {
		var thicknesses = {BR: 0, BL: 0, BC: 0, TR: 0, TL: 0, TC: 0, LT: 0, LC: 0, LB: 0, RT: 0, RC: 0, RB: 0};
		dojo.query(".desktopPanel").forEach(function(panel, i) {
			var w = dijit.byNode(panel);
			if(w.span == 1) {
				var slot = w.placement.charAt(0);
				if(w.orientation == "horizontal") {
					thicknesses[slot+"L"] += w.thickness;
					thicknesses[slot+"R"] += w.thickness;
					thicknesses[slot+"C"] += w.thickness;
				}
				else {
					thicknesses[slot+"T"] += w.thickness;
					thicknesses[slot+"B"] += w.thickness;
					thicknesses[slot+"C"] += w.thickness;
				}
			}
			else thicknesses[w.placement] += w.thickness;
		}, this);
		var max = {B: 0, T: 0, L: 0, R: 0};
		for(k in thicknesses) {
			if(max[k.charAt(0)] < thicknesses[k]) {
				max[k.charAt(0)] = thicknesses[k];
			}
		}
		return max;
	},
	/*
	 * Method: resize
	 * 
	 * Event handler
	 * Does some cleanup when the window is resized. For example it moves the filearea.
	 * Also called when a panel is moved.
	 */
	resize: function(e) {
		var max = this.getBox();
		var viewport = dijit.getViewport();
		dojo.style(this.filearea.domNode, "top", max.T+"px");
		dojo.style(this.filearea.domNode, "left", max.L+"px");
		dojo.style(this.filearea.domNode, "width", (viewport.w - max.R - max.L)+"px");
		dojo.style(this.filearea.domNode, "height", (viewport.h - max.B - max.T)+"px");
		dojo.query("div.win", desktop.ui.containerNode).forEach(function(win) {
			var c = dojo.coords(win);
			if(c.t < max.T && max.T > 0) dojo.style(win, "top", max.T+c.t+"px");
			if(c.l < max.L && max.L > 0) dojo.style(win, "left", max.L+c.l+"px");
			if(c.l > viewport.w - max.R && ((max.R > 0 || e.type=="resize") || (max.R > 0 && e.type=="resize"))) dojo.style(win, "left", (viewport.w - 20  - max.R)+"px");
			if(c.t > viewport.h - max.B && ((max.B > 0 || e.type=="resize") || (max.B > 0 && e.type=="resize"))) dojo.style(win, "top", (viewport.h - 20 - max.B)+"px");
			var wid = dijit.byNode(win);
			if(wid.maximized) wid.resize();
			
		}, this);
	},
	/*
	 * Method: updateWallpaper
	 * 
	 * Updates the wallpaper based on what's in desktop.config. Called when the configuration is applied.
	 */
	updateWallpaper: function() {
		var image = desktop.config.wallpaper.image;
		var color = desktop.config.wallpaper.color;
		var style = desktop.config.wallpaper.style;
		dojo.style(this.wallpaperNode, "backgroundColor", color);
		if(image == "") {
			if(this.wallpaperImageNode) {
				 this.wallpaperImageNode.parentNode.removeChild(this.wallpaperImageNode);
				 this.wallpaperImageNode = false;
			}
			dojo.style(this.wallpaperNode, "backgroundImage", "none");
			return;
		}
		else if(style == "centered" || style == "tiled")
			dojo.style(this.wallpaperNode, "backgroundImage", "url("+image+")");
			if(this.wallpaperImageNode) {
				 this.wallpaperImageNode.parentNode.removeChild(this.wallpaperImageNode);
				 this.wallpaperImageNode = false;
			}
		if(style == "centered")
			dojo.style(this.wallpaperNode, "backgroundRepeat", "no-repeat");
		else if(style == "tiled")
			dojo.style(this.wallpaperNode, "backgroundRepeat", "repeat");
		else if(style == "fillscreen") {
			dojo.style(this.wallpaperNode, "backgroundImage", "none");
			if(!this.wallpaperImageNode) {
				this.wallpaperImageNode = document.createElement("img");
				dojo.style(this.wallpaperImageNode, "width", "100%");
				dojo.style(this.wallpaperImageNode, "height", "100%");
				this.wallpaperNode.appendChild(this.wallpaperImageNode);
			}
			this.wallpaperImageNode.src = image;
		}
		var rule;
		try {
			rule = document.styleSheets[0].cssRules[0].style;
		}
		catch(e) {
			rule = document.styleSheets[0].rules[0].style;
		}
		rule.backgroundColor = desktop.config.wallpaper.color;

	}
});
