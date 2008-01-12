dojo.provide("desktop.ui");

desktop.ui = {
	draw: function() {
		desktop.ui._area = new desktop.ui.area();
		desktop.ui.domNode = desktop.ui._area.domNode;
		document.body.appendChild(desktop.ui.domNode);
	},
	init: function() {
		dojo.subscribe("configApply", this, this.makePanels);
	},
	makePanels: function() {
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
	templateString: "<div class=\"uiArea\"><div id=\"windowcontainer\"></div></div>"
});

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
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
		desktop.ui.save();
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

dojo.declare("desktop.ui.applet", [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {
	templateString: "<div class=\"desktopApplet\" dojoAttachEvent=\"onmouseover:_mouseover,onmouseout:_mouseout\"><div class=\"desktopAppletHandle\" dojoAttachPoint=\"handleNode\"></div><div class=\"desktopAppletContent\" dojoAttachPoint=\"containerNode\"></div></div>",
	settings: {},
	locked: false,
	pos: 0,
	fullspan: false,
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

dojo.declare("desktop.ui.applets.seperator", desktop.ui.applet, {
	postCreate: function() {
		dojo.addClass(this.containerNode, "seperator");
		dojo.style(this.handleNode, "background", "transparent none");
		dojo.style(this.handleNode, "zIndex", "100");
		dojo.style(this.containerNode, "zIndex", "1");
		this.inherited("postCreate", arguments);
	}
});

dojo.declare("desktop.ui.applets.netmonitor", desktop.ui.applet, {
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

dojo.declare("desktop.ui.applets.taskbar", desktop.ui.applet, {
	fullspan: true,
	postCreate: function() {
		dojo.addClass(this.containerNode, "desktopTaskbarApplet");
		this.inherited("postCreate", arguments);
	}
});

dojo.declare("desktop.ui.task", null, {
	templateString: "<div class=\"taskBarItem\" dojoAttachEvent=\"onclick:onClick\">${label}</div>",
	nodes: [],
	constructor: function(params) {
		dojo.mixin(this, params);
		this._makeNode();
		dojo.query(".desktopTaskbarApplet").forEach(dojo.hitch(this, function(item) {
			var div = this.domNode.cloneNode(true);
			dojo.style(div, "opacity", 0);
			item.appendChild(div);
			dojo.connect(div, "onclick", null, this.onClick);
			dojo.fadeIn({ node: div, duration: 200 }).play();
			this.nodes.push(div);
		}));
	},
	_makeNode: function() {
		this.domNode=document.createElement("div");
		this.domNode.onclick = this.onclick;
		dojo.addClass(this.domNode, "taskBarItem");
		if(this.icon) this.domNode.innerHTML = "<img src='"+this.icon+"' />";
		this.domNode.innerHTML += this.label;
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
	postCreate: function() {
		this._getApps();
		this._interval = setInterval(dojo.hitch(this, this._getApps), 1000*60);
		this.inherited("postCreate", arguments);
	},
	uninitialize: function() {
		clearInterval(this._interval);
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