dojo.provide("desktop.ui.applets.Taskbar");
dojo.provide("desktop.ui.applets.Task");
/*
 * Class: desktop.ui.applets.Taskbar
 * 
 * A window list applet that you can minimize windows to
 */
dojo.declare("desktop.ui.applets.Taskbar", desktop.ui.Applet, {
	dispName: "Window List",
	fullspan: true,
	postCreate: function() {
		dojo.addClass(this.containerNode, "desktopTaskbarApplet");
		this.inherited("postCreate", arguments);
	}
});
/*
 * Class: desktop.ui.Task
 * 
 * A task button that is used in desktop.ui.applets.Taskbar
 */
dojo.declare("desktop.ui.Task", null, {
	constructor: function(params) {
		this.icon = params.icon;
		this.nodes = [];
		this.label = params.label;
		this.onClick = params.onClick;
		dojo.query(".desktopTaskbarApplet").forEach(function(item) {
			var p = dijit.byNode(item.parentNode);
			var div = this._makeNode(p.getParent().getOrientation());
			dojo.style(div, "opacity", 0);
			item.appendChild(div);
			dojo.connect(div, "onclick", null, this.onClick);
			dojo.fadeIn({ node: div, duration: 200 }).play();
			this.nodes.push(div);
		}, this);
	},
	/*
	 * Method: _makeNode
	 * 
	 * Makes a node for the task button based on the applet's orientation
	 */
	_makeNode: function(orientation) {
		domNode=document.createElement("div");
		dojo.addClass(domNode, "taskBarItem");
		if(orientation == "horizontal") dojo.addClass(domNode, "taskBarItemHorizontal");
		else dojo.addClass(domNode, "taskBarItemVertical");
		if(this.icon) domNode.innerHTML = "<img src='"+this.icon+"' />";
		var v = this.label;
		if(v.length >= 18) {
		v = v.slice(0, 18);
		v += "...";
		}
		if(orientation == "vertical") {
			v = "<br />";
			dojo.forEach(this.label, function(s) {
				v += s + "<br />";
			});
		}
		domNode.innerHTML += v;
		this._domNode = domNode;
		this._orientation = orientation;
		return this._domNode;
	},
	/*
	 * Method: onClick
	 * 
	 * hook for onClick event
	 */
	onClick: function() {
	},
	destroy: function() {
		dojo.forEach(this.nodes, function(node){
			var onEnd = function() {
				node.parentNode.removeChild(node);
				node=null;
			}
			if (desktop.config.fx >= 1) {
				var fade = dojo.fadeOut({
					node: node,
					duration: 200
				});
				var slide = dojo.animateProperty({
					node: node,
					duration: 1000,
					properties: {
						width: {
							end: 0
						},
						height: {
							end: 0
						}
					}
				});
				var anim = dojo.fx.chain([fade, slide]);
				dojo.connect(slide, "onEnd", null, onEnd);
				anim.play();
			}
			else onEnd();
		});
	}
});
