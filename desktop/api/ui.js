dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.widget.Toaster");

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
	 * Method: authenticationDialog
	 * 
	 * Shows a simple authentication dialog
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	permission: string, //The permission to authenticate
	 * 		> 	program: string, //The program that wants this authentication (for UI only)
	 * 		> 	callback: function //Will return 0 or 1 to this when authenticated
	 * 		> }
	 */
	this.authenticationDialog = function(/*Object*/object)
	{
			if(this.authenticationWin) this.authenticationWin.bringToFront();
			else {
			if(!object.program) { object.program = "(unknown)"; }
			var win = this.authenticationWin = new api.window({
				title: "Authentication required",
				width: "450px",
				height: "350px",
				onClose: dojo.hitch(this, function() {
					this.authenticationWin = false;
					if(this.success != 0) { object.callback(1); }
				}),
				showClose: false,
				showMinimize: false,
				showMaximize: false
			});
			this.times = 3;
			this.success = 1;
			var top = new dijit.layout.ContentPane({layoutAlign: "top", style: "padding: 20px;"});
			top.setContent("An application is attempting to perform an action which requires privileges. Authentication is required to perform this action.");
			var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "padding: 40px;"});
			var row1 = document.createElement("div");
			row1.innerHTML = "Password:&nbsp;";
			var current = new dijit.form.TextBox({type: "password", style: "width: 125px;"});
			row1.appendChild(current.domNode);
			var row2 = document.createElement("div");
			var authButton = this.authButton = new dijit.form.Button({
				label: "Authenticate",
				onClick: dojo.hitch(this, function() {	
					desktop.user.authentication({
						permission: object.permission,
						action: "set",
						password: current.getValue(),
						callback: dojo.hitch(this, function(data) {
							if(data == 1 && (this.times - 1) != 0) { this.times--; this.row3.innerHTML = this.times; }
							else { object.callback(data); this.success = data; win.close(); }
						})
					})
				})
			})
			var closeButton = this.authButton = new dijit.form.Button({
				label: "Close",
				onClick: dojo.hitch(win, win.close)
			});
			row2.appendChild(authButton.domNode);
			row2.appendChild(closeButton.domNode);
			this.row3 = document.createElement("div");
			this.row3.innerHTML = this.times;
			var row4 = document.createElement("div");
			row4.innerHTML = "attempt(s) remaining";
			var main = document.createElement("div"); main.appendChild(row1); main.appendChild(row2); main.appendChild(this.row3); main.appendChild(row4);
			client.setContent(main);
			var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "padding: 20px;"});
			bottom.setContent("Program: "+object.program+"<br />Action: "+object.permission+"<br />Vendor:  (unknown)");
			dojo.forEach([top, bottom, client], function(e) {
				win.addChild(e);
			});
			win.show();
			win.startup();
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
	 *		>	types: array, //array which contains an object. e.g types[0].type = "txt"; types[0].typeShown = ".txt (Text)";
	 * 		> 	callback: function //a callback function. returns the path to the file/folder selected as a string
	 * 		> }
	 */
	this.fileDialog = function(/*Object*/object)
	{
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.form.FilteringSelect");
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
		this.pane = new dijit.layout.ContentPane({sizeMin: 30}, document.createElement("div"));
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
		if(object.types) {
		this.internalStore = new dojo.data.ItemFileWriteStore({});
		for(a=0;a<object.types.length;a++) {
		this.internalStore.newItem({type: object.types[a].type});
		}
		this.internalStore.newItem({type: ""});
		this.select = new dijit.form.FilteringSelect({store: this.internalStore, searchAttr: "type"});
		}
		this.button = new dijit.form.Button({label: "Load/Save", onClick: dojo.hitch(this, function() { p = this.address.getValue(); f = ""; if(object.types) { f = this.select.getValue(); } object.callback(p+f); dialog.close(); })});
		this.ablah = new dijit.form.Button({label: "Cancel", onClick: dojo.hitch(this, function() { object.callback(false); dialog.close(); })});
		var all = document.createElement("div");
		var line = document.createElement("div");
        var p = document.createElement("span");
		p.innerHTML = "Address:";
		line.appendChild(p);
		line.appendChild(this.address.domNode);
		if(object.types) line.appendChild(this.select.domNode);
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
	 * Show a toaster popup (similar to libnotify)
	 * 
	 * Arguments:
	 * 		message - the message to show. If an object, takes the following parameters:
	 * 		> {
	 * 		> 	message: string, // the message to show
	 * 		> 	type: string, //type of message. Can be "message", "warning", "error", or "fatal"
	 * 		> 	duration: integer //how long should the message be displayed in milliseconds
	 * 		> }
	 */
	this.notify = function(/*String|Object*/message)
	{
		dojo.publish("desktop_notification", [message]);
	}
	this.init = function() {
		api.addDojoCss("dojox/widget/Toaster/Toaster.css"); //TODO: theme it!
		var toaster = new dojox.widget.Toaster({
			messageTopic: "desktop_notification",
			positionDirection: desktop.config.toasterPos
		});
		desktop.ui._area.domNode.appendChild(toaster.domNode);
		dojo.subscribe("configApply", function() {
			toaster.positionDirection = desktop.config.toasterPos;
		})
	}
}
