dojo.provide("desktop.ui");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dojo.dnd.move");

dojo.declare("desktop.ui.panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick\"></div>",
	width: "100%",
	height: "20px",
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
		if (this.orientation == "br") {
			s.right = viewport.r + "px";
			s.width = (viewport.w - 2) + "px";
			s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight + "px";
		}
		if (this.orientation == "bl") {
			s.left = viewport.l + "px";
			s.width = (viewport.w - 2) + "px";
			s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight + "px";
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