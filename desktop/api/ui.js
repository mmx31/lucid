dojo.require("dijit.layout.ContentPane");

/* 
 * Class: api.ui
 * 
 * An API that provides things like dialogs and such
 */
api.ui = new function() {
	/*
	 * Method: alertDialog
	 * 
	 * Shows a simple alert dialog
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	title: string, //the title of the window
	 * 		> 	message: string, //the message to be shown in the body of the window
	 * 		> 	callback: function //a callback that is called when the dialog is closed
	 * 		> }
	 */
	this.alertDialog = function(/*Object*/object)
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
	/*
	 * Method: inputDialog
	 * 
	 * A dialog with a text field
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	title: string, //the title of the dialog's window
	 * 		> 	message: string, //a message to display above the text field and buttons
	 * 		> 	callback: function //a callback function. The first argument is the inputted string if the user clicked OK, but false if the user clicked cancel or closed the window.
	 * 		> }
	 * 
	 * Example:
	 * 		> api.ui.inputDialog({title: "UI Test", message: "What is your name?", callback: api.log});
	 */
	this.inputDialog = function(/*Object*/object)
	{
		var dialog = new api.window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function() {object.callback(false)});
		this.details = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		this.text = new dijit.form.TextBox({value: ""});
		all = document.createElement("div");
		this.blah = new dijit.form.Button({label: "OK", onClick: dojo.hitch(this, function() {  dojo.disconnect(onClose); object.callback(this.text.getValue()); dialog.close(); })});
		this.ablah = new dijit.form.Button({label: "Cancel", onClick: dojo.hitch(this, function() {  dojo.disconnect(onClose); object.callback(false); dialog.close(); })});
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
		dialog.addChild(this.details);
		dialog.showClose = false;
		dialog.show();
		dialog.startup();
	}
	/*
	 * Method: yesnoDialog
	 * 
	 * A yes or no dialog
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	title: string, //the title of the dialog's window
	 * 		> 	message: string, //a message to display above the yes/no buttons
	 * 		> 	callback: function //a callback function. The first argument is true if the user clicked yes, and false if the user clicked no or closed the window.
	 * 		> }
	 * 
	 * Example:
	 * 		> api.ui.yesnoDialog({title: "UI Test", message: "Did you sign your NDA?", callback: function(p) {
	 * 		> 	if(p) alert("Good for you!");
	 * 		> 	else alert("Then sign it allready!");
	 * 		> });
	 */
	this.yesnoDialog = function(/*Object*/object)
	{
		var dialog = new api.window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function() {object.callback(false)});
		this.details = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		all = document.createElement("div");
		this.blah = new dijit.form.Button({label: "Yes", onClick: dojo.hitch(this, function() { dojo.disconnect(onClose); object.callback(true); dialog.close(); })});
		this.ablah = new dijit.form.Button({label: "No", onClick: dojo.hitch(this, function() { dojo.disconnect(onClose); object.callback(false); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+object.message+"</center>";
		line.appendChild(p);
		all.appendChild(line);
		all.style.textAlign = "center";
		all.appendChild(this.blah.domNode);
		all.appendChild(this.ablah.domNode);
		this.details.setContent(all);
		dialog.addChild(this.details);
		dialog.showClose = false;
		dialog.show();
		dialog.startup();
	}
	/*
	 * Method: fileDialog
	 * 
	 * Shows a file selector dialog
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	title: string, //the title of the dialog's windows
	 * 		> 	callback: function //a callback function. returns the path to the file/folder selected as a string
	 * 		> }
	 */
	this.fileDialog = function(/*Object*/object)
	{
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.Menu");
		var dialog = new api.window(); //Make the window
		dialog.title = object.title;
		dialog.width = "500px";
		dialog.height = "300px";
		this.file = new api.filearea({onItem: dojo.hitch(this, function(path) { object.callback(path); dialog.close(); })}); //Make the fileArea
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
		dialog.addChild(this.toolbar);
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
		this.button = new dijit.form.Button({label: "Load/Save", onClick: dojo.hitch(this, function() { p = this.address.getValue(); object.callback(p); dialog.close(); })});
		this.ablah = new dijit.form.Button({label: "Cancel", onClick: dojo.hitch(this, function() { object.callback(false); dialog.close(); })});
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
		dialog.addChild(this.client);
		dialog.addChild(this.details);
		dialog.showClose = false;
		dialog.show();
		this.file.refresh();
		dialog.startup();
	}
	/*
	 * Method: notify
	 * 
	 * Show a toaster popup
	 * 
	 * Arguments:
	 * 		message - the message to show
	 */
	this.notify = function(/*String*/message)
	{
		dojo.publish("notification", [message]);
	}
}