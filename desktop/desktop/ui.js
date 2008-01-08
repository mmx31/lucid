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
		//go through each applet, make it vertical
	},
	_makeHorizontal: function() {
		dojo.removeClass(this.domNode, "desktopPanelVertical");
		dojo.addClass(this.domNode, "desktopPanelHorizontal");
		//go through each applet, make it horizontal
	},
	lock: function() {
		this.locked = true;
		//go through each applet, make them stationary
	},
	unlock: function() {
		this.locked = false;
		//go through each applet, make them movable
	},
	sanitize: function() {
		//save the applets' positions and dump it into a json string
	},
	unsanitize: function(str) {
		//create each applet, reset it's position, etc.
	}
});
dojo.declare("desktop.ui.applet", [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {
	templateString: "<div class=\"desktopApplet\"><div class=\"desktopAppletHandle\" dojoAttachPoint=\"handleNode\"></div><div class=\"desktopAppletContent\" dojoAttachPoint=\"containerNode\"></div></div>",
	lock: function() {
		//hide the applet's move handles
	},
	unlock: function() {
		//show the applet's move handles
	}
});