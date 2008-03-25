dojo.provide("desktop.ui.Applet");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("desktop.ui._appletMoveable");
/*
 * Class: desktop.ui.Applet
 * 
 * An applet that can be added to a panel
 */
dojo.declare("desktop.ui.Applet", [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {
	templateString: "<div class=\"desktopApplet\" dojoAttachEvent=\"onmouseover:_mouseover,onmouseout:_mouseout\"><div class=\"desktopAppletHandle\" dojoAttachPoint=\"handleNode\"></div><div class=\"desktopAppletContent\" dojoAttachPoint=\"containerNode\"></div></div>",
	/*
	 * Property: settings
	 * 
	 * An object with settings for the applet. This is persistant.
	 */
	settings: {},
	/*
	 * Property: locked
	 * 
	 * Weather or not the applet is locked on the panel.
	 */
	locked: false,
	/*
	 * Property: pos
	 * 
	 * The position of the applet on the panel.
	 * Horizontally, 0 would be on the left, and 1 would be on the right.
	 * Vertically, 0 would be on the top, 1 would be on the bottom.
	 */
	pos: 0,
	/*
	 * Property: fullspan
	 * 
	 * When set to true, the applet will take up as much space as possible without overlapping the next applet.
	 */
	fullspan: false,
	/*
	 * Property: dispName
	 * 
	 * The name that is displayed on the "Add to panel" dialog.
	 */
	dispName: "Applet",
	/*
	 * Property: appletIcon
	 * 
	 * The applet's iconClass on the "Add to panel" dialog.
	 */
	appletIcon: "icon-32-categories-applications-other",
	postCreate: function() {
		this._moveable = new desktop.ui._appletMoveable(this.domNode, {
			handle: this.handleNode,
			constraints: dojo.hitch(this, function() {
				var c = {};
				if (this.getParent().getOrientation() == "horizontal") {
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
			var pos = dojo.style(this.domNode, (this.getParent().getOrientation() == "horizontal" ? "left" : "top"));
			var barSize = dojo.style(this.getParent().domNode, (this.getParent().getOrientation() == "horizontal" ? "width" : "height"));
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
	/*
	 * Method: resize
	 * 
	 * fixes orientation and size of the applet
	 */
	resize: function() {
		var size = dojo.style(this.getParent().domNode, this.getParent().getOrientation() == "horizontal" ? "width" : "height");
		dojo.style(this.domNode, (this.getParent().getOrientation() == "horizontal" ? "left" : "top"), (this.pos*size)+"px");
		dojo.style(this.domNode, (this.getParent().getOrientation() != "horizontal" ? "left" : "top"), "0px");
		this._calcSpan(size);
	},
	/*
	 * Method: _calcSpan
	 * 
	 * If the fullspan property is true, this calculates the width or height of the applet,
	 * so that it is as big as possible without overlapping the next applet
	 * 
	 * Arguments:
	 * 		size - an optional argument to save an extra dojo.style call. This is the width/height of the parent panel (depending on orientation).
	 */
	_calcSpan: function(/*Integer*/size) {
		if(this.fullspan) {
			if(!size) size = dojo.style(this.getParent().domNode, this.getParent().getOrientation() == "horizontal" ? "width" : "height");
			var nextApplet = size;
			var children = this.getParent().getChildren();
			for(a in children) {
				var child = children[a];
				if(child.pos > this.pos) {
					nextApplet = child.pos*size;
					break;
				}
			}
			dojo.style(this.domNode, this.getParent().getOrientation() == "horizontal" ? "width" : "height", ((nextApplet - (this.pos*size)) - 1)+"px");
			dojo.style(this.domNode, this.getParent().getOrientation() == "horizontal" ? "height" : "width", "100%");
		}
	},
	uninitalize: function() {
		this._moveable.destroy();
	},
	/*
	 * Method: _mouseover
	 * 
	 * Event handler for when the onmouseover event
	 * Shows the repositioning handle if the applet is unlocked
	 */
	_mouseover: function() {
		if(!this.locked) dojo.addClass(this.handleNode, "desktopAppletHandleShow");
	},
	/*
	 * Method: _mouseout
	 * 
	 * Event handler for the onmouseout event
	 * Hides the repositioning handle
	 */
	_mouseout: function() {
		dojo.removeClass(this.handleNode, "desktopAppletHandleShow");
	},
	/*
	 * Method: lock
	 * 
	 * Locks the applet
	 */
	lock: function() {
		this.locked=true;
	},
	/*
	 * Method: unlock
	 * 
	 * Unlocks the applet
	 */
	unlock: function() {
		this.locked=false;
	},
	/*
	 * Method: setOrientation
	 * 
	 * Add any special things you need to do in order to change orientation in this function.
	 * 
	 * Arguments:
	 * 		orientation - will either be "horizontal" or "vertical"
	 */
	setOrientation: function(/*String*/orientation) {
	}
});