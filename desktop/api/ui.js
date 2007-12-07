/** 
* An API that provides things like dialogs and such
* 
* @classDescription An API that provides things like dialogs and such
* @memberOf api
*/
api.ui = new function() {
	this.alert = function(object)
	{
		this.alertDialog(object);
		api.console("api.ui.alert is depreciated and will expire in v1.0! use api.ui.alertDialog instead!");
	}
	this.alertDialog = function(object)
	{
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.innerHTML = "<center> "+object.message+" </center>";
		var box = new dijit.Dialog({title: object.title}, div);
		box.show();
		if(object.callback) {
			dojo.connect(box, 'onUnload', object.callback);
		}
	}
	this.inputDialog = function(object)
	{
		api.console("api.ui.inputDialog is not implamented yet.");
	}
	this.fileDialog = function(object)
	{
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.Menu");
		this.dialog = new api.window(); //Make the window
		this.dialog.title = object.title;
		this.dialog.width = "500px";
		this.dialog.height = "300px";
		this.dialog.setBodyWidget("LayoutContainer", {sizerWidth: 7, orientation: "horizontal"});		
		this.file = new api.filearea({onItem: dojo.hitch(this, function(path) { object.callback(path); this.dialog.destroy(); })}); //Make the fileArea
		this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
		var layout = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
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
		this.dialog.addChild(this.toolbar);
		
		
		this.client = new dijit.layout.SplitContainer({sizeMin: 30, sizeShare: 40, layoutAlign: "client"});
		
		this.pane = new dijit.layout.ContentPane({}, document.createElement("div"));
		this.details = new dijit.layout.ContentPane({layoutAlign: "bottom"}, document.createElement("div"));
		
		var menu = new dijit.Menu({});
		menu.domNode.style.width="100%";
		var item = new dijit.MenuItem({label: "Home",
			iconClass: "icon-16-places-user-home",
			onClick: dojo.hitch(this.file, function() { this.setPath("/"); })});
		menu.addChild(item);
		var item = new dijit.MenuItem({label: "Documents",
			iconClass: "icon-16-places-folder",
			onClick: dojo.hitch(this.file, function() { this.setPath("/Documents/"); })});
		menu.addChild(item);
		var item = new dijit.MenuItem({label: "Desktop",
			iconClass: "icon-16-places-user-desktop",
			onClick: dojo.hitch(this.file, function() { this.setPath("/Desktop/"); })});
		menu.addChild(item);
		this.pane.setContent(menu.domNode);
		this.details.setContent("Viewing \"psychfs:/home/\"");
		this.file.onPathChange = dojo.hitch(this, function(path) { this.details.setContent("Viewing \"psychfs:/home"+path+"\""); });
		this.file.onHighlight = dojo.hitch(this, function(path) { this.details.setContent("Selected \"psychfs:/home"+path+"\""); });
		this.client.addChild(this.pane);
		
		layout.addChild(this.file);
		this.client.addChild(layout);
		
		this.dialog.addChild(this.client);
		this.dialog.addChild(this.details);
		this.dialog.show();
		this.file.refresh();
		this.dialog.startup();
	}
}