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
	_buttons: {},
	_labels: {},
	_connects: [],
	postCreate: function() {
		dojo.addClass(this.containerNode, "desktopTaskbarApplet");
		this.inherited("postCreate", arguments);
	},
	startup: function() {
		var store = desktop.ui._windowList;
		this._connects = [
			dojo.connect(store, "onNew", this, "onNew"),
			dojo.connect(store, "onDelete", this, "onDelete"),
			dojo.connect(store, "onSet", this, "onSet")
		];
		store.fetch({
			onItem: dojo.hitch(this, "onNew")
		});
	},
	uninitialize: function() {
		dojo.forEach(this._connects, dojo.disconnect, dojo);
		this.inherited("uninitialize", arguments);
	},
	onSet: function(item, attribute, oldValue, v) {
		var store = desktop.ui._windowList;
		if(attribute != "label") return;
		if(v.length >= 18) {
			v = v.slice(0, 18) + "...";
		}
		this._labels[store.getValue(item, "id")].textContent = v;
	},
	onNew: function(item) {
		var store = desktop.ui._windowList;
		var domNode=document.createElement("div");
		dojo.addClass(domNode, "taskBarItem");
		if(this.getParent().getOrientation() == "horizontal") dojo.addClass(domNode, "taskBarItemHorizontal");
		else dojo.addClass(domNode, "taskBarItemVertical");
		if(store.hasAttribute(item, "icon")) domNode.innerHTML = "<img src='"+store.getValue(item, "icon")+"' />";
		var v = store.getValue(item, "label");
		if(v.length >= 18) {
			v = v.slice(0, 18) + "...";
		}
		var labelNode = document.createElement("span");
		labelNode.textContent = v;
		domNode.appendChild(labelNode);
		
		this._connects[store.getValue(item, "id")] = dojo.connect(domNode, "onclick", dijit.byId(store.getValue(item, "id")), "_onTaskClick");
		
		this._buttons[store.getValue(item, "id")] = domNode;
		this._labels[store.getValue(item, "id")] = labelNode;
		this.containerNode.appendChild(domNode);
	},
	onDelete: function(item) {
		var node = this._buttons[item.id[0]];
		dojo.disconnect(this._connects[item.id[0]]);
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
	}
});