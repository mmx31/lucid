dojo.require("dijit.layout.ContentPane");

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
		api.log("api.ui.alertDialog is depreciated and will expire in v1.0! use api.ui.alertDialog instead!");
	}
	this.alertDialog = function(object)
	{
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.innerHTML = "<center> "+object.message+" </center>";
		var box = new dijit.Dialog({title: object.title, style: object.style || ""}, div);
		box.show();
		if(object.callback) {
			dojo.connect(box, 'onUnload', object.callback);
		}
	}
	this.inputDialog = function(object)
	{
		//api.ui.inputDialog({title: "UI Test", message: "What is your name?", callback: api.log});
		this.dialog = new api.window();
		this.dialog.title = object.title;	
		this.dialog.width = "400px";
		this.dialog.height = "150px";
		this.details = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		this.text = new dijit.form.TextBox({value: ""});
		all = document.createElement("div");
		this.blah = new dijit.form.Button({label: "OK", onClick: dojo.hitch(this, function() { a = this.text.getValue(); object.callback(a); this.dialog.destroy(); })});
		this.ablah = new dijit.form.Button({label: "Cancel", onClick: dojo.hitch(this, function() { object.callback(false); this.dialog.destroy(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+object.message+"</center>";
		line.appendChild(p);
		all.appendChild(line);
		all.style.textAlign = "center";
		all.appendChild(this.text.domNode);
		all.appendChild(this.blah.domNode);
		all.appendChild(this.ablah.domNode);
		this.details.setContent(all);
		this.dialog.addChild(this.details);
		this.dialog.showClose = false;
		this.dialog.show();
		this.dialog.startup();
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
		this.client = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 70, layoutAlign: "client"});
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
        this.address = new dijit.form.TextBox({value: "/"});
		this.button = new dijit.form.Button({label: "Load/Save", onClick: dojo.hitch(this, function() { p = this.address.getValue(); object.callback(p); this.dialog.destroy(); })});
		this.ablah = new dijit.form.Button({label: "Cancel", onClick: dojo.hitch(this, function() { object.callback(false); this.dialog.destroy(); })});
		var all = document.createElement("div");
		var line = document.createElement("div");
        var p = document.createElement("span");
		p.innerHTML = "Address:";
		line.appendChild(p);
		line.appendChild(this.address.domNode);
		line.appendChild(this.button.domNode);
		line.appendChild(this.ablah.domNode);
		all.appendChild(line);
		this.details.setContent(all);
		this.file.onPathChange = dojo.hitch(this, function(path) { this.address.setValue(path); });
		this.file.onHighlight = dojo.hitch(this, function(path) { this.address.setValue(path); });
		this.client.addChild(this.pane);
		layout.addChild(this.file);
		this.client.addChild(layout);
		this.dialog.addChild(this.client);
		this.dialog.addChild(this.details);
		this.dialog.showClose = false;
		this.dialog.show();
		this.file.refresh();
		this.dialog.startup();
	}
}