dojo.provide("desktop.ui.Panel");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Button");
dojo.requireLocalization("desktop.ui", "panel");
dojo.requireLocalization("desktop", "common");
/*
 * Class: desktop.ui.Panel
 * 
 * A customizable toolbar that you can reposition and add/remove/reposition applets on
 */
dojo.declare("desktop.ui.Panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick, oncontextmenu:_onRightClick\"><div class=\"desktopPanel-start\"><div class=\"desktopPanel-end\"><div class=\"desktopPanel-middle\" dojoAttachPoint=\"containerNode\"></div></div></div></div>",
	/*
	 * Property: span
	 * a number between 0 and 1 indicating how far the panel should span accross (1 being the whole screen, 0 being none)
	 */
	span: 1,
	/*
	 * Property: opacity
	 * a number between 0 and 1 indicating how opaque the panel should be (1 being visible, 0 being completely transparent)
	 */
	opacity: 1,
	/*
	 * Property: thickness
	 * how thick the panel should be in pixels
	 */
	thickness: 24,
	/*
	 * Property: locked
	 * are the applets and the panel itself be repositionable?
	 */
	locked: false,
	/*
	 * Property: placement
	 * where the panel should be placed on the screen. 
	 * acceptible values are "BL", "BR", "BC", "TL", "TR", "TC", "LT", "LB", "LC", "RT", "RB", or "RC".
	 * The first character indicates the side, the second character indicates the placement.
	 * R = right, L = left, T = top, and B = bottom.
	 * So LT would be on the left side on the top corner. 
	 */
	placement: "BL",
	/*
	 * Method: getOrientation
	 * 
	 * Gets the orientation of the panel
	 * Returns "horizontal" or "vertical"
	 */
	getOrientation: function() {
		var s = this.placement.charAt(0);
		return (s == "B" || s == "T") ? "horizontal" : "vertical";
	},
	/*
	 * Method: _onClick
	 * 
	 * Event handler for when the mouse is pressed. Makes various event connections.
	 */
	_onClick: function(e) {
		if(!this.locked) {
			this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			this._onOutEvent = dojo.connect(this.domNode, "onmouseout", this, function(){
				dojo.disconnect(this._onOutEvent);
				this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
				this._docEvents = [
					dojo.connect(document, "ondragstart", dojo, "stopEvent"),
					dojo.connect(document, "onselectstart", dojo, "stopEvent")
				];
				this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			});
		}
		dojo.stopEvent(e);
	},
	/*
	 * Method: _onRightClick
	 * 
	 * Event handler for when the right mouse button is pressed. Shows the panel's context menu.
	 */
	_onRightClick: function(e) {
		var l = dojo.i18n.getLocalization("desktop.ui", "panel");
		if(this.menu) this.menu.destroy();
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: l.addToPanel, iconClass: "icon-16-actions-list-add", onClick: dojo.hitch(this, this.addDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: l.properties, iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.propertiesDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: l.deletePanel, iconClass: "icon-16-actions-edit-delete", disabled: (typeof dojo.query(".desktopPanel")[1] == "undefined"), onClick: dojo.hitch(this, function() {
			//TODO: animate?
			this.destroy();
		})}));
		this.menu.addChild(new dijit.MenuSeparator);
		if(this.locked) {
			this.menu.addChild(new dijit.MenuItem({label: l.unlock, onClick: dojo.hitch(this, this.unlock)}));
		}
		else {
			this.menu.addChild(new dijit.MenuItem({label: l.lock, onClick: dojo.hitch(this, this.lock)}));
		}
		this.menu.addChild(new dijit.MenuSeparator);
		this.menu.addChild(new dijit.MenuItem({label: l.newPanel, iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, function() {
			var p = new desktop.ui.Panel();
			desktop.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		})}));
		this.menu._contextMouse();
		this.menu._openMyself(e);
		//TODO: destroy menu when blurred?
	},
	/*
	 * Method: propertiesDialog
	 * 
	 * Shows a small properties dialog for the panel.
	 */
	propertiesDialog: function() {
		var l = dojo.i18n.getLocalization("desktop.ui", "panel");
		var c = dojo.i18n.getLocalization("desktop", "common");
		if(this.propertiesWin) {
			this.propertiesWin.bringToFront();
			return;
		}
		var win = this.propertiesWin = new api.Window({
			title: l.panelProperties,
			width: "180px",
			height: "200px",
			onClose: dojo.hitch(this, function() {
				this.propertiesWin = false;
			})
		});
		var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "padding: 5px;"});
		var div = document.createElement("div");
		var rows = {
			width: {
				widget: "HorizontalSlider",
				params: {
					maximum: 1,
					minimum: 0.01,
					value: this.span,
					showButtons: false,
					onChange: dojo.hitch(this, function(value) {
						this.span = value;
						this._place();
					})
				}
			},
			thickness: {
				widget: "NumberSpinner",
				params: {
					constraints: {min: 20, max: 200},
					value: this.thickness,
					style: "width: 60px;",
					onChange: dojo.hitch(this, function(value) {
						this.thickness = value;
						dojo.style(this.domNode, this.getOrientation() == "horizontal" ? "width" : "height", this.thickness+"px");
						this._place();
					})
				}
			},
			opacity: {
				widget: "HorizontalSlider",
				params: {
					maximum: 1,
					minimum: 0.1,
					value: this.opacity,
					showButtons: false,
					onChange: dojo.hitch(this, function(value) {
						this.opacity = value;
						dojo.style(this.domNode, "opacity", value);
					})
				}
			}
		};
		for(key in rows) {
			var row = document.createElement("div");
			dojo.style(row, "marginBottom", "5px");
			row.innerHTML = (l[key] || key)+":&nbsp;";
			row.appendChild(new dijit.form[rows[key].widget](rows[key].params).domNode);
			div.appendChild(row);
		};
		client.setContent(new dijit.form.Form({}, div).domNode);
		win.addChild(client);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: c.close});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function() {
			this.propertiesWin.close();
		});
		win.show();
		win.startup();
	},
	/*
	 * Method: addDialog
	 * 
	 * Shows the "Add to panel" dialog so the user can add applets
	 */
	addDialog: function() {
		var l = dojo.i18n.getLocalization("desktop.ui", "panel");
		var a = dojo.i18n.getLocalization("desktop.ui", "applets");
		var c = dojo.i18n.getLocalization("desktop", "common");
		if(this.window) {
			this.window.bringToFront();
			return;
		}
		var win = this.window = new api.Window({
			title: l.addToPanel,
			onClose: dojo.hitch(this, function() {
				this.window = false;
			})
		});
		var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "border: 1px solid black;"});
		this.addDialogSelected = "";
		this.addDialogIcons = [];
		var div = document.createElement("div");
		dojo.forEach([
			{k: "overflow", v: "auto"},
			{k: "width", v: "100%"},
			{k: "height", v: "100%"}
		], function(i) {
			dojo.style(div, i.k, i.v);
		});
		for(key in desktop.ui.appletList) {
			var header = document.createElement("h4");
			header.innerText = key;
			div.appendChild(header);
			for(applet in desktop.ui.appletList[key]) {
				var name = desktop.ui.appletList[key][applet];
				var iconClass = desktop.ui.applets[name].prototype.appletIcon;
				var dispName = desktop.ui.applets[name].prototype.dispName;
				dispName = a[dispName] || dispName;
				c = document.createElement("div");
				c.name = name;
				dojo.addClass(c, "dijitInline");
				c.innerHTML = "<div class='"+iconClass+"'></div><span style='padding-top: 5px; padding-bottom: 5px;'>"+dispName+"</span>";
				div.appendChild(c);
				this.addDialogIcons.push(c);
			}
			div.appendChild(document.createElement("hr"));
		}
		client.setContent(div);
		win.addChild(client);
		dojo.forEach(this.addDialogIcons, function(c) {
			dojo.connect(c, "onclick", this, function(e) {
				dojo.forEach(this.addDialogIcons, function(icon) {
					dojo.removeClass(icon, "selectedItem");
				})
				dojo.addClass(c, "selectedItem");
				this.addDialogSelected = c.name;
			});
		}, this);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: l.addToPanel, style: "float: right;"});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function() {
			if(dojo.isFunction(desktop.ui.applets[this.addDialogSelected])) {
				var applet = new desktop.ui.applets[this.addDialogSelected]();
				this.addChild(applet);
				applet.startup();
				desktop.ui.save();
			}
		});
		win.show();
		win.startup();
	},
	/*
	 * Method: _onRelease
	 * 
	 * Disconnects the event handlers that were created in _onClick
	 */
	_onRelease: function() {
		dojo.disconnect(this._onDragEvent);
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onOutEvent); //just to be sure...
		dojo.forEach(this._docEvents, dojo.disconnect);
	},
	/*
	 * Method: _onMove
	 * 
	 * Event handler for when the panel is being dragged.
	 * gets nearest edge, moves the panel there if we're not allready, and re-orients itself
	 * also checks for any panels allready placed on that edge
	 */
	_onMove: function(e) {
		var viewport = dijit.getViewport();
		var newPos;

		if(e.clientY < viewport.h/3 && e.clientX < viewport.w/3) {
			if(e.clientX / (viewport.w/3) > e.clientY / (viewport.h/3)) newPos = "TL";
			else newPos = "LT";
		}
		else if(e.clientY > (viewport.h/3)*2 && e.clientX < viewport.w/3) {
			if(e.clientX / (viewport.w/3) > ((viewport.h/3)-(e.clientY-(viewport.h/3)*2)) / (viewport.h/3))
				newPos = "BL";
			else
				newPos = "LB";
			
		}
		else if(e.clientY < viewport.h/3 && e.clientX > (viewport.w/3)*2) {
			if(((viewport.w/3)-(e.clientX-(viewport.w/3)*2)) / (viewport.w/3) > e.clientY / (viewport.h/3))
				newPos = "TR";
			else
				newPos = "RT";
		}
		else if(e.clientY > (viewport.h/3)*2 && e.clientX > (viewport.w/3)*2) {
			if((e.clientX - (viewport.w/3)*2) / (viewport.w/3) > (e.clientY - (viewport.h/3)*2) / (viewport.h/3)) newPos = "RB";
			else newPos = "BR";
		}
		else {
			if(e.clientY < viewport.h/3) newPos = "TC";
			else if(e.clientX < viewport.w/3) newPos = "LC";
			else if(e.clientY > (viewport.h/3)*2) newPos = "BC";
			else if(e.clientX > (viewport.w/3)*2) newPos = "RC";
			else newPos = this.placement;
		}
		if (this.placement != newPos) {
			this.placement = newPos;
			desktop.ui._area.resize();
			this._place();
		}
		dojo.stopEvent(e);
	},
	uninitialize: function() {
		dojo.forEach(this.getChildren(), function(item) {
			item.destroy();
		});
		setTimeout(dojo.hitch(desktop.ui._area, "resize"), 1000);
		if(this.window) this.window.destroy();
	},
	/*
	 * Method: _place
	 * 
	 * Updates the position and size of the panel
	 */
	_place: function() {
		var viewport = dijit.getViewport();
		var s = {};
		if(this.placement.charAt(0) == "T" || this.placement.charAt(0) == "B") {
			this._makeHorizontal();
			if(this.placement.charAt(1) == "R") 
				s.left = (viewport.w - this.domNode.offsetWidth);
			if(this.placement.charAt(1) == "L") 
				s.left = viewport.l;
			if(this.placement.charAt(1) == "C") {
				if(this.span != 1) {
					s.left = (viewport.w - (this.span*viewport.w)) / 2;
				}
				else 
					s.left = viewport.l;
			}
			
			if(this.placement.charAt(0) == "B") 
				s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
			else 
				if(this.placement.charAt(0) == "T") 
					s.top = viewport.t;
		}
		else {
			//we need a completely different layout algorytm :D
			this._makeVertical();
			if(this.placement.charAt(1) == "C") {
				if(this.span != 1) {
					var span = dojo.style(this.domNode, "height");
					s.top = (viewport.h - span)/2;
				}
			}
			else if(this.placement.charAt(1) == "B") {
				s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
			}
			else {
				s.top = viewport.t;
			}
			if(this.placement.charAt(0) == "L") {
				s.left = viewport.l;
			}
			else {
				s.left = (viewport.w + viewport.l) - this.domNode.offsetWidth;
			}
		}
		var sides = {
			T: "Top",
			L: "Left",
			R: "Right",
			B: "Bottom"
		}
		for(sk in sides) {
			dojo.removeClass(this.domNode, "desktopPanel"+sides[sk]);
		}
		dojo.addClass(this.domNode, "desktopPanel"+sides[this.placement.charAt(0)]);
		
		var count = 0;
		//check for other panels in the same slot as us
		dojo.query(".desktopPanel").forEach(dojo.hitch(this, function(panel) {
			var panel = dijit.byNode(panel);
			if(panel.id != this.id) {
				if(this.placement.charAt(0) == panel.placement.charAt(0) && (panel.span==1 || this.span==1)) count += panel.thickness;
				else if(panel.placement == this.placement)
					count += panel.thickness;
			}
		}));
		if(this.placement.charAt(0) == "L" || this.placement.charAt(0) == "T") s[this.getOrientation() == "horizontal" ? "top" : "left"] += count;
		else s[this.getOrientation() == "horizontal" ? "top" : "left"] -= count;
		if(desktop.config.fx) {
			var props = {};
			for(key in s) {
				props[key] = {end: s[key], unit: "px"};
			}
			dojo.animateProperty({
				node: this.domNode,
				properties: props,
				duration: desktop.config.window.animSpeed
			}).play();
		}
		else {
			for(key in s) {
				dojo.style(this.domNode, key, s[key]+"px");
			}
		}
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
		desktop.ui.save();
	},
	/*
	 * Method: resize
	 * 
	 * Called when the window is resized. Resizes the panel to the new window height
	 */
	resize: function() {
		var viewport = dijit.getViewport();
		dojo.style(this.domNode, (this.getOrientation() == "horizontal" ? "width" : "height"), (this.span*viewport[(this.getOrientation() == "horizontal" ? "w" : "h")])+"px");
		dojo.style(this.domNode, (this.getOrientation() == "vertical" ? "width" : "height"), this.thickness+"px");
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
	},
	/*
	 * Method: _makeVertical
	 * 
	 * Orients the panel's applets vertically
	 */
	_makeVertical: function() {
		dojo.removeClass(this.domNode, "desktopPanelHorizontal");
		dojo.addClass(this.domNode, "desktopPanelVertical");
		this.resize();
	},
	/*
	 * Method: _makeHorizontal
	 * 
	 * Orients the panel's applets horizontally
	 */
	_makeHorizontal: function() {
		dojo.removeClass(this.domNode, "desktopPanelVertical");
		dojo.addClass(this.domNode, "desktopPanelHorizontal");
		this.resize();
	},
	/*
	 * Method: lock
	 * 
	 * Locks the panel
	 */
	lock: function() {
		this.locked = true;
		dojo.forEach(this.getChildren(), function(item) {
			item.lock();
		});
	},
	/*
	 * Method: unlock
	 * 
	 * Unlocks the panel
	 */
	unlock: function() {
		this.locked = false;
		dojo.forEach(this.getChildren(), function(item) {
			item.unlock();
		});
	},
	/*
	 * Method: dump
	 * 
	 * Returns a javascript object that can be used to restore the panel using the restore method
	 */
	dump: function() {
		var applets = [];
		var myw = dojo.style(this.domNode, "width"), myh = dojo.style(this.domNode, "height");
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item) {
			var left=dojo.style(item.domNode, "left"), top=dojo.style(item.domNode, "top");
			var pos = (this.getOrientation() == "horizontal" ? left : top);
			pos = pos / (this.getOrientation() == "horizontal" ? myw : myh);
			var applet = {
				settings: item.settings,
				pos: pos,
				declaredClass: item.declaredClass
			};
			applets.push(applet);
		}));
		return applets;
	},
	/*
	 * Method: restore
	 * 
	 * Restores the panel's applets
	 * 
	 * Arguments:
	 * 		applets - an array of applets to restore (generated by the dump method)
	 */
	restore: function(/*Array*/applets) {
		var size = dojo.style(this.domNode, this.getOrientation() == "horizontal" ? "width" : "height");
		dojo.forEach(applets, dojo.hitch(this, function(applet) {
			var construct = eval(applet.declaredClass);
			var a = new construct({settings: applet.settings, pos: applet.pos});
			if(this.locked) a.lock();
			else a.unlock();
			this.addChild(a);
			a.startup();
		}));
	},
	startup: function() {
		if(desktop.config.fx) {
			//TODO: add to viewport when there are other panels around!
			var viewport = dijit.getViewport();
			if(this.placement.charAt(0) == "B") {
				dojo.style(this.domNode, "top", (viewport.h + this.thickness)+"px");
			}
			else if(this.placement.charAt(0) == "T") {
				dojo.style(this.domNode, "top", (-(this.thickness))+"px")
			}
			else if(this.placement.charAt(0) == "R") {
				dojo.style(this.domNode, "left", (viewport.w + this.thickness)+"px");
			}
			else {
				dojo.style(this.domNode, "left", (-(this.thickness))+"px");
			}
			
			if(this.placement.charAt(1) == "T") {
				dojo.style(this.domNode, "top", "0px");
			} else if(this.placement.charAt(1) == "B") {
				dojo.style(this.domNode, "top", (viewport.h - this.domNode.offsetHeight)+"px");
			} else if(this.placement.charAt(1) == "L") {
				dojo.style(this.domNode, "left", "0px");
			} else if(this.placement.charAt(1) == "R") {
				dojo.style(this.domNode, "left", (viewport.w - this.domNode.offsetWidth)+"px");
			}
			else {
				if(this.getOrientation() == "horizontal")
					dojo.style(this.domNode, "left", (( viewport.w - (viewport.w*this.span))/2)+"px");
				else
					dojo.style(this.domNode, "top", ((viewport.h - (this.span*viewport.h)) / 2)+"px");
			}
		}
		dojo.style(this.domNode, "zIndex", 9999*9999);
		dojo.style(this.domNode, "opacity", this.opacity);
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"_place");
		}
		dojo.connect(window,'onresize',this, "_place");
		this._place();
		//if(this.getOrientation() == "horizontal") this._makeHorizontal();
		//else this._makeVertical();
	}
});