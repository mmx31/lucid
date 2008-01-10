dojo.provide("desktop.ui");

desktop.ui = {
	init: function() {
		//we can't use draw() because we need to fetch the config first
		var panels = desktop.config.panels;
		dojo.forEach(panels, function(panel) {
			var args = {
				thickness: panel.thickness,
				span: panel.span,
				locked: panel.locked,
				orientation: panel.orientation,
				placement: panel.placement
			}
			var p = new desktop.ui.panel(args);
			p.fromJson(panel.applets);
			document.body.appendChild(p.domNode);
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
				applets: wid.toJson()
			}
		});
	}
}

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dojo.dnd.move");

dojo.declare("desktop.ui.panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick\"></div>",
	span: "100%",
	thickness: 24,
	locked: false,
	orientation: "horizontal",
	placement: "BL",
	_onClick: function() {
		if(!this.locked) {
			this._onOutEvent = dojo.connect(this.domNode, "onmouseout", this, function(){
				this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
			});
			this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
		}
	},
	_onRelease: function() {
		dojo.disconect(this._onOutEvent);
		dojo.disconect(this._onInEvent);
		dojo.disconect(this._onDragEvent);
		dojo.disconect(this._docMouseUpEvent);
	},
	_onMove: function() {
		this._onInEvent = dojo.connect(this.domNode, "onmouseover", this, function() {
			dojo.disconect(this._onDragEvent);
		})
		//get nearest edge, move the panel there if we're not allready, re-orient ourself
		//also check for any panels allready placed on that edge
	},
	_place: function() {
		var viewport = dijit.getViewport();
		var s = this.domNode.style;
		dojo.style(this.domNode, (this.orientation == "horizontal" ? "width" : "height"), this.span);
		dojo.style(this.domNode, (this.orientation == "vertical" ? "width" : "height"), this.thickness);
		if(this.placement[1] == "R")
			s.right = viewport.r + "px";
		if(this.placement[1] == "L")
			s.left = viewport.l + "px";
		if(this.placement[1] == "C") {
			if(this.span != "100%") {
				var span = dojo.style(this.domNode, (this.orientation == "horizontal" ? "width" : "height"));
				s[(this.orientation == "horizontal" ? "left" : "top")] = (viewport[(this.orientation == "horizontal" ? "w" : "h")] - span) / 2;
			}
			else s[(this.orientation == "horizontal" ? "left" : "top")] = viewport.l + "px";
		}
		
		if(this.placement[0] == "B")
			s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight + "px";
		else 
			s.top = (viewport.t - this.domNode.offsetHeight) + "px";
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
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"_place");
		}
		dojo.connect(window,'onresize',this,"_place");
		
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