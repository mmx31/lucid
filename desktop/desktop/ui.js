dojo.provide("desktop.ui");

desktop.ui = {
	draw: function() {
		desktop.ui._area = new desktop.ui.area();
		desktop.ui.containerNode = desktop.ui._area.containerNode;
		document.body.appendChild(desktop.ui._area.domNode);
	},
	init: function() {
		dojo.subscribe("configApply", this, this.makePanels);
		dojo.subscribe("configApply", this, function() {
			desktop.ui._area.updateWallpaper();
		});
		dojo.require("dojo.dnd.autoscroll");
		dojo.dnd.autoScroll = function(e) {} //in order to prevent autoscrolling of the window
	},
        drawn: false,
	makePanels: function() {
                if(this.drawn) {
		        dojo.query(".desktopPanel").forEach(function(panel) {
			       var p = dijit.byNode(panel);
			       p._place();
		        }, this);
                        return;
                }
	        this.drawn = true;
                var panels = desktop.config.panels;
		dojo.forEach(panels, function(panel) {
			var args = {
				thickness: panel.thickness,
				span: panel.span,
				orientation: panel.orientation,
				placement: panel.placement,
				opacity: panel.opacity
			}
			var p = new desktop.ui.panel(args);
			if(panel.locked) p.lock();
			else p.unlock();
			p.restore(panel.applets);
			desktop.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		});
		desktop.ui._area.resize();
	},
	save: function() {
		desktop.config.panels = [];
		dojo.query(".desktopPanel").forEach(function(panel, i) {
			var wid = dijit.byNode(panel);
			desktop.config.panels[i] = {
				thickness: wid.thickness,
				span: wid.span,
				locked: wid.locked,
				orientation: wid.orientation,
				placement: wid.placement,
				opacity: wid.opacity,
				applets: wid.dump()
			}
		});
	}
}

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.dnd.move");

dojo.declare("desktop.ui.area", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"uiArea\"><div dojoAttachPoint=\"widgetNode\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10; display: none;\"></div><div dojoAttachPoint=\"containerNode\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10;\"></div><div dojoAttachPoint=\"wallpaperNode\" class=\"wallpaper\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1;\"></div></div>",
	drawn: false,
	postCreate: function() {
		var filearea = this.filearea = new api.filearea({path: "/Desktop/", forDesktop: true, subdirs: false, style: "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;", overflow: "hidden"});
		dojo.addClass(filearea.domNode, "mainFileArea");
		filearea.refresh();
		dojo.style(filearea.domNode, "zIndex", 1);
		this.containerNode.appendChild(filearea.domNode);
		dojo.addClass(this.widgetNode, "widgetLayer");
		this.widgetLayer = new desktop.ui.widgetArea({}, this.widgetNode);
		
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"resize");
		}
		dojo.connect(window,'onresize',this,"resize");
	},
	resize: function(e) {
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
		var viewport = dijit.getViewport();
		dojo.style(this.filearea.domNode, "top", max.T);
		dojo.style(this.filearea.domNode, "left", max.L);
		dojo.style(this.filearea.domNode, "width", viewport.w - max.R);
		dojo.style(this.filearea.domNode, "height", viewport.h - max.B);
		dojo.query("div.win", desktop.ui.containerNode).forEach(function(win) {
			var c = dojo.coords(win);
			if(c.t < max.T && max.T > 0) dojo.style(win, "top", max.T+c.t+"px");
			if(c.l < max.L && max.L > 0) dojo.style(win, "left", max.L+c.l+"px");
			if(viewport.w - (c.l) < max.R && max.R > 0) dojo.style(win, "left", (viewport.w - (viewport.w - c.l)  - max.R)+"px");
			if(viewport.h - (c.t) < max.B && max.B > 0) dojo.style(win, "top", (viewport.h - (viewport.h - c.t) - max.B)+"px");
		}, this);
	},
	updateWallpaper: function() {
		var image = desktop.config.wallpaper.image;
		var color = desktop.config.wallpaper.color;
		dojo.style(this.wallpaperNode, "backgroundImage", (image ? "url("+image+")" : "none"));
		dojo.style(this.wallpaperNode, "backgroundColor", color);
		var css = dojo.byId("corestyle").sheet;
		if (css.cssRules)
			var rules = css.cssRules
		else if (css.rules)
			var rules = css.rules
		rules[0].style.backgroundColor = desktop.config.wallpaper.color;
	}
});

dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.declare("desktop.ui.widgetArea", dijit.layout.TabContainer, {
	restoreWidgets: function() {
		if(!this.drawn) {
			this.drawn = true;
			var widgets = desktop.config.widgets;
			for(i in widgets) {
				var pane = new dijit.layout.ContentPane({title: i});
			}
		}
	},
	dump: function() {
		var obj = {};
		dojo.forEach(this.getChildren(), function(c) {
			
		});
	}
});
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Slider");
dojo.require("dijit.form.NumberSpinner");
dojo.declare("desktop.ui.panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick, oncontextmenu:_onRightClick, ondragstart:_stopSelect, onselectstart:_stopSelect\"><div class=\"desktopPanel-start\"><div class=\"desktopPanel-end\"><div class=\"desktopPanel-middle\" dojoAttachPoint=\"containerNode\"></div></div></div></div>",
	span: 1,
	opacity: 1,
	thickness: 24,
	locked: false,
	orientation: "horizontal",
	placement: "BL",
	_stopSelect: function(e) {
		dojo.stopEvent(e);
	},
	_onClick: function() {
		if(!this.locked) {
			this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			this._onOutEvent = dojo.connect(this.domNode, "onmouseout", this, function(){
				dojo.disconnect(this._onOutEvent);
				this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
				this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			});
		}
	},
	_onRightClick: function(e) {
		if(this.menu) this.menu.destroy();
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: "Add to panel", iconClass: "icon-16-actions-list-add", onClick: dojo.hitch(this, this.addDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: "Properties", iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.propertiesDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: "Delete This Panel", iconClass: "icon-16-actions-edit-delete", disabled: (typeof dojo.query(".desktopPanel")[1] == "undefined"), onClick: dojo.hitch(this, function() {
			//TODO: animate?
			this.destroy();
		})}));
		this.menu.addChild(new dijit.MenuSeparator);
		if(this.locked) {
			this.menu.addChild(new dijit.MenuItem({label: "Unlock the Panel", onClick: dojo.hitch(this, this.unlock)}));
		}
		else {
			this.menu.addChild(new dijit.MenuItem({label: "Lock the Panel", onClick: dojo.hitch(this, this.lock)}));
		}
		this.menu.addChild(new dijit.MenuSeparator);
		this.menu.addChild(new dijit.MenuItem({label: "New Panel", iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, function() {
			var p = new desktop.ui.panel();
			desktop.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		})}));
		this.onRightClick(this.locked);
		this.menu._contextMouse();
		this.menu._openMyself(e);
	},
	propertiesDialog: function() {
		if(this.propertiesWin) {
			this.propertiesWin.bringToFront();
			return;
		}
		var win = this.propertiesWin = new api.window({
			title: "Panel Properties",
			bodyWidget: "LayoutContainer",
			width: "180px",
			height: "200px",
			onClose: dojo.hitch(this, function() {
				this.propertiesWin = false;
			})
		});
		var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "padding: 5px;"});
		var div = document.createElement("div");
		var rows = {
			Width: {
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
			Thickness: {
				widget: "NumberSpinner",
				params: {
					constraints: {min: 20, max: 200},
					value: this.thickness,
					style: "width: 60px;",
					onChange: dojo.hitch(this, function(value) {
						this.thickness = value;
						dojo.style(this.domNode, this.orientation == "horizontal" ? "width" : "height", this.thickness+"px");
						this._place();
					})
				}
			},
			Opacity: {
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
			row.innerHTML = key+":&nbsp;";
			row.appendChild(new dijit.form[rows[key].widget](rows[key].params).domNode);
			div.appendChild(row);
		};
		client.setContent(new dijit.form.Form({}, div).domNode);
		win.addChild(client);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: "Close"});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function() {
			this.propertiesWin.close();
		});
		win.show();
		win.startup();
	},
	addDialog: function() {
		if(this.window) {
			this.window.bringToFront();
			return;
		}
		var win = this.window = new api.window({
			title: "Add to panel",
			bodyWidget: "LayoutContainer",
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
		var button = new dijit.form.Button({label: "Add to panel", style: "float: right;"});
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
	onRightClick: function(lock) {
		//This is a hook for third party panels to add stuff to the right click menu of the panel
	},
	_onRelease: function() {
		dojo.disconnect(this._onDragEvent);
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onOutEvent); //just to be sure...
	},
	_onMove: function(e) {
		//get nearest edge, move the panel there if we're not allready, re-orient ourself
		//also check for any panels allready placed on that edge
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
	},
	uninitialize: function() {
		dojo.forEach(this.getChildren(), function(item) {
			item.destroy();
		});
	},
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
		if(this.placement.charAt(0) == "L" || this.placement.charAt(0) == "T") s[this.orientation == "horizontal" ? "top" : "left"] += count;
		else s[this.orientation == "horizontal" ? "top" : "left"] -= count;
		if(desktop.config.fx) {
			var props = {};
			for(key in s) {
				props[key] = {end: s[key]};
			}
			dojo.animateProperty({
				node: this.domNode,
				properties: props,
				duration: desktop.config.window.animSpeed
			}).play();
		}
		else {
			for(key in s) {
				this.domNode.style[key] = s[key]+"px";
			}
		}
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
		desktop.ui.save();
	},
	resize: function() {
		var viewport = dijit.getViewport();
		dojo.style(this.domNode, (this.orientation == "horizontal" ? "width" : "height"), this.span*viewport[(this.orientation == "horizontal" ? "w" : "h")]);
		dojo.style(this.domNode, (this.orientation == "vertical" ? "width" : "height"), this.thickness);
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
	},
	_makeVertical: function() {
		this.orientation="vertical";
		dojo.removeClass(this.domNode, "desktopPanelHorizontal");
		dojo.addClass(this.domNode, "desktopPanelVertical");
		this.resize();
	},
	_makeHorizontal: function() {
		this.orientation="horizontal";
		dojo.removeClass(this.domNode, "desktopPanelVertical");
		dojo.addClass(this.domNode, "desktopPanelHorizontal");
		this.resize();
	},
	lock: function() {
		this.locked = true;
		dojo.forEach(this.getChildren(), function(item) {
			item.lock();
		});
	},
	unlock: function() {
		this.locked = false;
		dojo.forEach(this.getChildren(), function(item) {
			item.unlock();
		});
	},
	dump: function() {
		var applets = [];
		var myw = dojo.style(this.domNode, "width"), myh = dojo.style(this.domNode, "height");
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item) {
			var left=dojo.style(item.domNode, "left"), top=dojo.style(item.domNode, "top");
			var pos = (this.orientation == "horizontal" ? left : top);
			pos = pos / (this.orientation == "horizontal" ? myw : myh);
			var applet = {
				settings: item.settings,
				pos: pos,
				declaredClass: item.declaredClass
			};
			applets.push(applet);
		}));
		return applets;
	},
	restore: function(applets) {
		var size = dojo.style(this.domNode, this.orientation == "horizontal" ? "width" : "height");
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
				dojo.style(this.domNode, "top", viewport.h + this.thickness);
			}
			else if(this.placement.charAt(0) == "T") {
				dojo.style(this.domNode, "top", -(this.thickness))
			}
			else if(this.placement.charAt(0) == "R") {
				dojo.style(this.domNode, "left", viewport.w + this.thickness);
			}
			else {
				dojo.style(this.domNode, "left", -(this.thickness));
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
				if(this.orientation == "horizontal")
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
		dojo.connect(window,'onresize',this,"_place");
		this._place();
		//if(this.orientation == "horizontal") this._makeHorizontal();
		//else this._makeVertical();
	}
});

dojo.declare("desktop.ui._appletMoveable", dojo.dnd.move.constrainedMoveable, {
	onMove: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary: called during every move notification,
		//	should actually move the node, can be overwritten.
		var c = this.constraintBox;
		leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
		leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;
		dojo.marginBox(mover.node, leftTop);
		this.onMoved(mover, leftTop);
	}
});
dojo.require("dijit.Menu");
dojo.declare("desktop.ui.applet", [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {
	templateString: "<div class=\"desktopApplet\" dojoAttachEvent=\"onmouseover:_mouseover,onmouseout:_mouseout\"><div class=\"desktopAppletHandle\" dojoAttachPoint=\"handleNode\"></div><div class=\"desktopAppletContent\" dojoAttachPoint=\"containerNode\"></div></div>",
	settings: {},
	locked: false,
	pos: 0,
	fullspan: false,
	dispName: "Applet",
	appletIcon: "icon-32-categories-applications-other",
	postCreate: function() {
		this._moveable = new desktop.ui._appletMoveable(this.domNode, {
			handle: this.handleNode,
			constraints: dojo.hitch(this, function() {
				var c = {};
				if (this.getParent().orientation == "horizontal") {
					var c = {
						t: 0,
						l: 0,
						w: dojo.style(this.getParent().domNode, "width") - (this.fullspan ? 0 : dojo.style(this.domNode, "width")),
						h: 0
					}
				}
				else {
					var c = {
						t: 0,
						l: 0,
						w: 0,
						h: dojo.style(this.getParent().domNode, "height") - (this.fullspan ? 0 : dojo.style(this.domNode, "height"))
					}
				}
				return c;
			})
		});
		this._moveable.onMoved = dojo.hitch(this, function(e, f) {
			var pos = dojo.style(this.domNode, (this.getParent().orientation == "horizontal" ? "left" : "top"));
			var barSize = dojo.style(this.getParent().domNode, (this.getParent().orientation == "horizontal" ? "width" : "height"));
			this.pos = pos/barSize;
			dojo.forEach(this.getParent().getChildren(), function(item) {
				item._calcSpan();
			});
			desktop.ui.save();
		});
		if(this.fullspan) dojo.addClass(this.domNode, "desktopAppletFullspan");
		var menu = this.menu = new dijit.Menu({});
		this.menu.bindDomNode(this.handleNode);
		dojo.forEach([
			{
				label: "Remove from panel",
				iconClass: "icon-16-actions-list-remove",
				onClick: dojo.hitch(this, function() {
					this.destroy();
					desktop.ui.save();
				})
			}
		], function(args) {
			var item = new dijit.MenuItem(args);
			menu.addChild(item);
		});
		//TODO: get it so that applets don't overlap eachother
	},
	resize: function() {
		var size = dojo.style(this.getParent().domNode, this.getParent().orientation == "horizontal" ? "width" : "height");
		dojo.style(this.domNode, (this.getParent().orientation == "horizontal" ? "left" : "top"), this.pos*size);
		dojo.style(this.domNode, (this.getParent().orientation != "horizontal" ? "left" : "top"), 0);
		this._calcSpan(size);
	},
	_calcSpan: function(size) {
		if(this.fullspan) {
			if(!size) size = dojo.style(this.getParent().domNode, this.getParent().orientation == "horizontal" ? "width" : "height");
			var nextApplet = size;
			var children = this.getParent().getChildren();
			for(a in children) {
				var child = children[a];
				if(child.pos > this.pos) {
					nextApplet = child.pos*size;
					break;
				}
			}
			dojo.style(this.domNode, this.getParent().orientation == "horizontal" ? "width" : "height", (nextApplet - (this.pos*size)) - 1);
		}
	},
	uninitalize: function() {
		this._moveable.destroy();
	},
	_mouseover: function() {
		if(!this.locked) dojo.addClass(this.handleNode, "desktopAppletHandleShow");
	},
	_mouseout: function() {
		dojo.removeClass(this.handleNode, "desktopAppletHandleShow");
	},
	lock: function() {
		this.locked=true;
	},
	unlock: function() {
		this.locked=false;
	},
	setOrientation: function(orientation) {
		//add any special things you need to do in order to change orientation in this function
	}
});

desktop.ui.appletList = {
		"Accessories": ["clock"],
		"Desktop & Windows": ["taskbar"],
		"System & Hardware": ["netmonitor"],
		"Utilities": ["menu", "seperator"]
}

dojo.declare("desktop.ui.applets.seperator", desktop.ui.applet, {
	dispName: "Seperator",
	postCreate: function() {
		dojo.addClass(this.containerNode, "seperator");
		dojo.style(this.handleNode, "background", "transparent none");
		dojo.style(this.handleNode, "zIndex", "100");
		dojo.style(this.containerNode, "zIndex", "1");
		this.inherited("postCreate", arguments);
	}
});

dojo.declare("desktop.ui.applets.netmonitor", desktop.ui.applet, {
	dispName: "Network Monitor",
	appletIcon: "icon-32-status-network-transmit-receive",
	postCreate: function() {
		dojo.addClass(this.containerNode, "icon-22-status-network-idle");
		this._xhrStart = dojo.connect(dojo,"_ioSetArgs",this,function(m)
		{
			this.removeClasses();
			var f = Math.random();
			if(f <= (1/3)) dojo.addClass(this.containerNode, "icon-22-status-network-receive");
			else if(f <= (2/3)) dojo.addClass(this.containerNode, "icon-22-status-network-transmit");
			else dojo.addClass(this.containerNode, "icon-22-status-network-transmit-receive");
		}); 
		this._xhrEnd = dojo.connect(dojo.Deferred.prototype,"_fire",this,function(m)
		{
			this.removeClasses();
			dojo.addClass(this.containerNode, "icon-22-status-network-idle");
		}); 
		this.inherited("postCreate", arguments);
	},
	removeClasses: function() {
		dojo.removeClass(this.containerNode, "icon-22-status-network-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-idle");
	},
	uninitialize: function() {
		dojo.disconnect(this._xhrStart);
		dojo.disconnect(this._xhrEnd);
		this.inherited("uninitialize", arguments);
	}
});

dojo.require("dijit.form.Button");
dojo.require("dijit._Calendar");
dojo.declare("desktop.ui.applets.clock", desktop.ui.applet, {
	dispName: "Clock",
	postCreate: function() {
		var calendar = new dijit._Calendar({});
		this.button = new dijit.form.DropDownButton({
			label: "loading...",
			dropDown: calendar
		}, this.containerNode);
		this.clockInterval = setInterval(dojo.hitch(this, function(){
			var clock_time = new Date();
			var clock_hours = clock_time.getHours();
			var clock_minutes = clock_time.getMinutes();
			var clock_seconds = clock_time.getSeconds();
			var clock_suffix = "AM";
			if (clock_hours > 11){
				clock_suffix = "PM";
				clock_hours = clock_hours - 12;
			}
			if (clock_hours == 0){
				clock_hours = 12;
			}
			if (clock_hours < 10){
				clock_hours = "0" + clock_hours;
			}if (clock_minutes < 10){
				clock_minutes = "0" + clock_minutes;
			}if (clock_seconds < 10){
				clock_seconds = "0" + clock_seconds;
			}
			var p = clock_hours + ":" + clock_minutes + ":" + clock_seconds + " " + clock_suffix;
			if(this.getParent().orientation == "vertical") {
				var v = "";
				dojo.forEach(p, function(e) {
					v += e + "<br />";
				})
				p = v;
			}
			this.button.setLabel(p);
		}), 1000);
		this.inherited("postCreate", arguments);
	},
	uninitialize: function() {
		clearInterval(this.clockInterval);
		this.inherited("uninitialize", arguments);
	}
});

dojo.declare("desktop.ui.applets.taskbar", desktop.ui.applet, {
	dispName: "Window List",
	fullspan: true,
	postCreate: function() {
		dojo.addClass(this.containerNode, "desktopTaskbarApplet");
		this.inherited("postCreate", arguments);
	}
});

dojo.declare("desktop.ui.task", null, {
	constructor: function(params) {
		this.icon = params.icon;
		this.nodes = [];
		this.label = params.label;
		this.onClick = params.onClick;
		dojo.query(".desktopTaskbarApplet").forEach(function(item) {
			var p = dijit.byNode(item.parentNode);
			var div = this._makeNode(p.getParent().orientation);
			dojo.style(div, "opacity", 0);
			item.appendChild(div);
			dojo.connect(div, "onclick", null, this.onClick);
			dojo.fadeIn({ node: div, duration: 200 }).play();
			this.nodes.push(div);
		}, this);
	},
	_makeNode: function(orientation) {
		domNode=document.createElement("div");
		dojo.addClass(domNode, "taskBarItem");
		if(orientation == "horizontal") dojo.addClass(domNode, "taskBarItemHorizontal");
		else dojo.addClass(domNode, "taskBarItemVertical");
		if(this.icon) domNode.innerHTML = "<img src='"+this.icon+"' />";
		var v = this.label;
		if(orientation == "vertical") {
			v = "<br />";
			dojo.forEach(this.label, function(s) {
				v += s + "<br />";
			});
		}
		domNode.innerHTML += v;
		return domNode;
	},
	onClick: function() {
		//hook for onClick event
	},
	destroy: function() {
		dojo.forEach(this.nodes, function(node){
			var anim = dojo.fadeOut({ node: node, duration: 200 });
			dojo.connect(anim, "onEnd", null, function() {
				node.parentNode.removeChild(node);
				node=null;
			});
			anim.play();
		});
	}
});

dojo.declare("desktop.ui.applets.menu", desktop.ui.applet, {
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
	_drawButton: function() {
		dojo.require("dijit.form.Button");
		if (this._menubutton) {
			this._menubutton.destroy();
		}
		var div = document.createElement("div");
		this.containerNode.appendChild(div);
		var b = new dijit.form.DropDownButton({
			iconClass: "menubutton-icon",
			label: "Apps",
			showLabel: false,
			dropDown: this._menu
		}, div);
		dojo.addClass(b.domNode, "menuApplet");
		dojo.style(b.focusNode, "border", "0px");
		dojo.query(".dijitA11yDownArrow", b.focusNode).style("display", "none");
		b.domNode.style.height="100%";
		b.startup();
		this._menubutton = b;
	},
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
				menu.addChild(new dijit.MenuItem({
					label: "Log Out", 
					iconClass: "icon-16-actions-system-log-out",
					onClick: desktop.user.logout
				}));
				menu.domNode.style.display="none";
				menu.startup();
				this._drawButton();
			})
		});
	}
});
