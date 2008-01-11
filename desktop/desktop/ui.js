dojo.provide("desktop.ui");

desktop.ui = {
	init: function() {
		dojo.subscribe("configApply", this, this.makePanels);
	},
	makePanels: function() {
		desktop.ui.domNode = document.createElement("div");
		dojo.addClass(desktop.ui.domNode, "uiArea");
		document.body.appendChild(desktop.ui.domNode);
		
		var panels = desktop.config.panels;
		dojo.forEach(panels, function(panel) {
			var args = {
				thickness: panel.thickness,
				span: panel.span,
				locked: panel.locked,
				orientation: panel.orientation,
				placement: panel.placement,
				opacity: panel.opacity
			}
			var p = new desktop.ui.panel(args);
			p.fromJson(panel.applets);
			desktop.ui.domNode.appendChild(p.domNode);
			p.startup();
		});
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
				applets: wid.toJson()
			}
		});
	}
}

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.dnd.move");

dojo.declare("desktop.ui.panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick\"></div>",
	span: "100%",
	opacity: 1,
	thickness: 24,
	locked: false,
	orientation: "horizontal",
	placement: "BL",
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
	_onRelease: function() {
		dojo.disconnect(this._onDragEvent);
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onOutEvent); //just to be sure...
	},
	_onMove: function(e) {
		//get nearest edge, move the panel there if we're not allready, re-orient ourself
		//also check for any panels allready placed on that edge
		var viewport = dijit.getViewport();
		var newPos = "";

		if(e.clientY < viewport.h/3)
			newPos += "T";
		//else if(e.clientY > (viewport.h/3)*2)
		else if(e.clientY > (viewport.h/2))
			newPos += "B";
		//else
		//	newPos += "B"; //because C does not work yet

		if(e.clientX < viewport.w/3)
			newPos += "L";
		else if(e.clientX > (viewport.w/3)*2)
			newPos += "R";
		else
			newPos += "C";

		if (this.placement != newPos) {
			this.placement = newPos;
			this._place();
		}
	},
	_place: function() {
		var viewport = dijit.getViewport();
		var s = {};
		dojo.style(this.domNode, (this.orientation == "horizontal" ? "width" : "height"), this.span);
		dojo.style(this.domNode, (this.orientation == "vertical" ? "width" : "height"), this.thickness);
		if(this.placement[1] == "R")
			s.left = (viewport.w - this.domNode.offsetWidth);
		if(this.placement[1] == "L")
			s.left = viewport.l;
		if(this.placement[1] == "C") {
			if(this.span != "100%") {
				var span = dojo.style(this.domNode, (this.orientation == "horizontal" ? "width" : "height"));
				s[(this.orientation == "horizontal" ? "left" : "top")] = (viewport[(this.orientation == "horizontal" ? "w" : "h")] - span) / 2;
			}
			else s[(this.orientation == "horizontal" ? "left" : "top")] = viewport.l;
		}
		
		if(this.placement[0] == "B")
			s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
		else 
			s.top = viewport.t;
			
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
	},
	_makeVertical: function() {
		dojo.removeClass(this.domNode, "desktopPanelHorizontal");
		dojo.addClass(this.domNode, "desktopPanelVertical");
		this._swapAppletOrientation("vertical");
	},
	_makeHorizontal: function() {
		dojo.removeClass(this.domNode, "desktopPanelVertical");
		dojo.addClass(this.domNode, "desktopPanelHorizontal");
		this._swapAppletOrientation("horizontal");
	},
	_swapAppletOrientation: function(orientation) {
		dojo.forEach(this.getChildren(), function(item) {
			var t = dojo.style(item.domNode, "top");
			var l = dojo.style(item.domNode, "left");
			dojo.style(item.domNode, "top", l);
			dojo.style(item.domNode, "left", t);
			item.setOrientation(orientation);
		});
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
	toJson: function() {
		var applets = [];
		var myw = dojo.style(this.domNode, "width"), myh = dojo.style(this.domNode, "height");
		dojo.forEach(this.getChildren(), function(item) {
			var left=dojo.style(item.domNode, "left"), top=dojo.style(item.domNode, "top");
			var side = "start";
			var half = (this.orientation == "horizontal" ? myw : myh) / 2;
			var pos = (this.orientation == "horizontal" ? left : top);
			if(pos > half) {
				side = "end";
				pos = (this.orientation == "horizontal" ? dojo.style(item.domNode, "right") : dojo.style(item.domNode, "bottom"));
			}
			var applet = {
				settings: dojo.toJson(item.settings),
				pos: pos,
				side: side,
				declaredClass: item.declaredClass
			};
			applets.push(applet);
		});
		return dojo.toJson(applets);
	},
	fromJson: function(str) {
		var applets = dojo.fromJson(str);
		dojo.forEach(applets, dojo.hitch(this, function(applet) {
			var construct = eval(applet.declaredClass);
			var a = new construct({settings: applet.settings});
			dojo.style(a.domNode, (this.orientation == "horizontal" ? (applet.side == "start" ? "left" : "right") : (applet.side == "start" ? "top" : "bottom")));
			this.addChild(a);
		}));
	},
	startup: function() {
		dojo.style(this.domNode, "zIndex", 9999*9999);
		dojo.style(this.domNode, "opacity", this.opacity);
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"_place");
		}
		dojo.connect(window,'onresize',this,"_place");
		this._place();
		dojo.style(this.domNode, "width", this.width);
		dojo.style(this.domNode, "height", this.height);
		if(this.orientation == "horizontal") this._makeHorizontal();
		else this._makeVertical();
	}
});
dojo.declare("desktop.ui.applet", [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {
	templateString: "<div class=\"desktopApplet\"><div class=\"desktopAppletHandle\" dojoAttachPoint=\"handleNode\"></div><div class=\"desktopAppletContent\" dojoAttachPoint=\"containerNode\"></div></div>",
	settings: {},
	postCreate: function() {
		this._moveable = new dojo.dnd.move.parentConstrainedMoveable({
			node: this.domNode,
			handle: this.handleNode
		});
		//TODO: get it so that applets don't overlap eachother
	},
	uninitalize: function() {
		this._moveable.destroy();
	},
	lock: function() {
		dojo.style(this.handleNode, "display", "none");
	},
	unlock: function() {
		dojo.style(this.handleNode, "display", "block");
	},
	setOrientation: function(orientation) {
		//add any special things you need to do in order to change orientation in this function
	}
});

dojo.declare("desktop.ui.applets.menu", desktop.ui.applet, {
	postCreate: function() {
		this._getApps();
		this._interval = setInterval(dojo.hitch(this, this._getApps), 1000*60)
	},
	uninitialize: function() {
		clearInterval(this._interval);
		if(this._menubutton) this._menubutton.destroy();
		if(this._menu) this._menu.destroy();
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
		b.domNode.style.height="100%";
		b.startup();
		this._menubutton = b;
	},
	_getApps: function() {
		dojo.xhrGet({
			url: desktop.core.backend("core.app.fetch.list"),
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
					//category.addChild(dojo.doc.createElement("span"));
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
					onClick: desktop.core.logout
				}));
				menu.domNode.style.display="none";
				menu.startup();
				dojo.doc.body.appendChild(menu.domNode);
				this._drawButton();
			})
		});
	}
});
