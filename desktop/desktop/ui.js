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
	postCreate: function() {
		dojo.style(this.domNode, "width", this.width);
		dojo.style(this.domNode, "height", this.height);
	},
	_onClick: function() {
		if (!this.locked) {
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
			if(item.declaredClass == "desktop.ui.applet") {
				item.lock();
			}
		});
	},
	unlock: function() {
		this.locked = false;
		dojo.forEach(this.getChildren(), function(item) {
			if(item.declaredClass == "desktop.ui.applet") {
				item.unlock();
			}
		});
	},
	sanitize: function() {
		var applets = [];
		dojo.forEach(this.getChildren(), function(item) {
			var applet = {
				settings: dojo.toJson(item.settings),
				top: dojo.style(item.domNode, "top"),
				left: dojo.style(item.domNode, "left")
			};
			applets.push(applet);
		});
		return dojo.toJson(applets);
	},
	unsanitize: function(str) {
		//create each applet, reset it's position, etc.
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
		
	}
});