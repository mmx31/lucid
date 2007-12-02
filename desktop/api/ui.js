/** 
* An API that provides things like dialogs and such
* 
* @classDescription An API that provides things like dialogs and such
* @memberOf api
*/
api.ui = new function() {
	this.alert = function(object)
	{
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.innerHTML = "<center> "+object.message+" </center>";
		var box = new dijit.Dialog({title: object.title}, div);
		box.show();
	}
	this.fileDialog = function(object)
	{
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.Menu");
		this.dialog = new api.window(); //Make the window
		this.dialog.title = object.title;
		this.dialog.width = "300px";
		this.dialog.height = "200px";
		this.dialog.setBodyWidget("SplitContainer", {sizerWidth: 7, orientation: "horizontal"});
		this.file = new api.filearea({layoutAlign: "bottom"}); //Make the fileArea
		this.file.onItem = object.callback; // Override the default
		this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
		this.pane = new dijit.layout.ContentPane({sizeMin: 10, sizeShare: 20}, document.createElement("div"));
		var menu = new dijit.Menu({});
		menu.domNode.style.width="100%";
		var item = new dijit.MenuItem({label: "Home",
						       iconClass: "icon-16-devices-drive-harddisk",
						       onClick: dojo.hitch(this.file, function() { this.setPath("/"); })});
							   menu.addChild(item);
		var item = new dijit.MenuItem({label: "My Documents",
						       iconClass: "icon-22-actions-go-home",
						       onClick: dojo.hitch(this.file, function() { this.setPath("/Documents/"); })});
							   menu.addChild(item);
		var item = new dijit.MenuItem({label: "Desktop",
						       iconClass: "icon-22-actions-go-home",
						       onClick: dojo.hitch(this.file, function() { this.setPath("/Desktop/"); })});
							   menu.addChild(item);
		this.pane.setContent(menu.domNode);
		this.dialog.addChild(this.pane);
		var layout = new dijit.layout.LayoutContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.file, function() {
				this.setPath("/");
			}),
			iconClass: "icon-16-places-user-home",
			label: "Home"
		});
		this.toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.file, this.file.up),
			iconClass: "icon-16-actions-go-up",
			label: "Up"
		});
		this.toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.file, this.file.refresh),
			iconClass: "icon-16-actions-view-refresh",
			label: "Refresh"
		});
		this.toolbar.addChild(button);
		layout.addChild(this.toolbar);
		layout.addChild(this.file);
		this.dialog.addChild(layout);
		this.dialog.show();
	}
}