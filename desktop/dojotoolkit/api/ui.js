dojo.provide("api.ui");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.widget.Toaster");
dojo.requireLocalization("desktop", "common");

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
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var ac = dojo.i18n.getLocalization("desktop.ui", "accountInfo");
		if(this.authenticationWin) this.authenticationWin.bringToFront();
		else {
		if(!object.program) { object.program = ac.unknown; }
		var times = 3;
		var success = 1;
		var win = this.authenticationWin = new api.Window({
			title: ac.authRequired,
			width: "450px",
			height: "350px",
			onClose: dojo.hitch(this, function() {
				this.authenticationWin = false;
				if(success != 0) { object.callback(1); }
			}),
			showClose: false,
			showMinimize: false,
			showMaximize: false
		});
		var top = new dijit.layout.ContentPane({layoutAlign: "top", style: "padding: 20px;"});
		top.setContent(ac.sudoExplanation);
		var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "padding: 40px;"});
		var row3 = document.createElement("span");
		var row1 = document.createElement("div");
		row1.innerHTML = ac.password+":&nbsp;";
		var current = new dijit.form.TextBox({type: "password", style: "width: 125px;"});
		row1.appendChild(current.domNode);
		var row2 = document.createElement("div");
		var authButton = this.authButton = new dijit.form.Button({
			label: ac.authenticate,
			onClick: dojo.hitch(this, function() {	
				desktop.user.authentication({
					permission: object.permission,
					action: "set",
					password: current.getValue(),
					callback: dojo.hitch(this, function(data) {
						if(data == 1 && (times - 1) != 0) { times--; row3.innerHTML = times; } //TODO: client side security? wtf are you on?!
						else { object.callback(data); success = data; win.close(); }
					})
				})
			})
		})
		var closeButton = this.authButton = new dijit.form.Button({
			label: cm.close,
			onClick: dojo.hitch(win, win.close)
		});
		row2.appendChild(authButton.domNode);
		row2.appendChild(closeButton.domNode);
		var row4 = document.createElement("div");
		row4.textContent = ac.attemptsRemaining+": ";
		row3.innerHTML = times;
		row4.appendChild(row3);
		var main = document.createElement("div"); main.appendChild(row1); main.appendChild(row2); main.appendChild(row4);
		client.setContent(main);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "padding: 20px;"});
		bottom.setContent(ac.program+": "+object.program+"<br />"+ac.action+": "+object.permission+"<br />"+ac.vendor+": "+ac.unknown);
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
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var dialog = new api.Window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function() {object.callback(false)});
		var details = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		var text = new dijit.form.TextBox({value: ""});
		all = document.createElement("div");
		var blah = new dijit.form.Button({label: cm.ok, onClick: dojo.hitch(this, function() {  dojo.disconnect(onClose); object.callback(text.getValue()); dialog.close(); })});
		var ablah = new dijit.form.Button({label: cm.cancel, onClick: dojo.hitch(this, function() {  dojo.disconnect(onClose); object.callback(false); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+object.message+"</center>";
		line.appendChild(p);
		all.appendChild(line);
		all.style.textAlign = "center";
		all.appendChild(text.domNode);
		all.appendChild(blah.domNode);
		all.appendChild(ablah.domNode);
		details.setContent(all);
		dialog.addChild(details);
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
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var dialog = new api.Window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function() {object.callback(false)});
		this.details = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		all = document.createElement("div");
		var blah = new dijit.form.Button({label: cm.yes, onClick: dojo.hitch(this, function() { dojo.disconnect(onClose); object.callback(true); dialog.close(); })});
		var ablah = new dijit.form.Button({label: cm.no, onClick: dojo.hitch(this, function() { dojo.disconnect(onClose); object.callback(false); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+object.message+"</center>";
		line.appendChild(p);
		all.appendChild(line);
		all.style.textAlign = "center";
		all.appendChild(blah.domNode);
		all.appendChild(ablah.domNode);
		details.setContent(all);
		dialog.addChild(details);
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
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var pl = dojo.i18n.getLocalization("desktop", "places");
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		//dojo.require("dijit.form.FilteringSelect");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.Menu");
		var dialog = new api.Window(); //Make the window
		dialog.title = object.title;
		dialog.width = "500px";
		dialog.height = "300px";
		var file = new api.Filearea({path: "file://", onItem: dojo.hitch(this, function(path) {
			object.callback(path);
			dialog.close();
		})}); //Make the fileArea
		var toolbar = new dijit.Toolbar({layoutAlign: "top"});
		var layout = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.file, "setPath", "file://"),
			iconClass: "icon-16-places-user-home",
			label: pl.Home
		});
		toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.file, "up"),
			iconClass: "icon-16-actions-go-up",
			label: cm.up
		});
		toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(file, "refresh"),
			iconClass: "icon-16-actions-view-refresh",
			label: cm.refresh
		});
		toolbar.addChild(button);
		dialog.addChild(this.toolbar);
		var client = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 70, layoutAlign: "client"});
		var pane = new dijit.layout.ContentPane({sizeMin: 125}, document.createElement("div"));
		var details = new dijit.layout.ContentPane({layoutAlign: "bottom"}, document.createElement("div"));
		var menu = new dijit.Menu({
			style: "width: 100%;"
		});
		dojo.forEach(desktop.config.filesystem.places, function(place) {
			var item = new dijit.MenuItem({label: place.name,
				iconClass: place.icon || "icon-16-places-folder",
				onClick: dojo.hitch(file, "setPath", place.path)
			});
			menu.addChild(item);
		}, this);
		pane.setContent(menu.domNode);
   		var address = new dijit.form.TextBox({value: "file://"});
		/*if(object.types) {
			var store = this.internalStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "type",
					items: object.types
				}
			});
			//store.newItem({type: ""});
		}*/
		var button = new dijit.form.Button({label: cm.loadOrSave, onClick: dojo.hitch(this, function() { 
			var p = this.address.getValue();
			var f = "";
			//if(object.types) { f = this.select.getValue(); }
			object.callback(p+f);
			dialog.close();
		})});
		var ablah = new dijit.form.Button({label: cm.cancel, onClick: dojo.hitch(this, function() {
			object.callback(false);
			dialog.close();
		})});
		var all = document.createElement("div");
		var line = document.createElement("div");
        var p = document.createElement("span");
		p.innerHTML = cm.path+":";
		line.appendChild(p);
		line.appendChild(this.address.domNode);
		//if(object.types) line.appendChild(this.select.domNode);
		line.appendChild(button.domNode);
		line.appendChild(ablah.domNode);
		all.appendChild(line);
		details.setContent(all);
		file.onPathChange = dojo.hitch(this, function(path) { address.setValue(path); });
		file.onHighlight = dojo.hitch(this, function(path) { address.setValue(path); });
		client.addChild(pane);
		layout.addChild(file);
		client.addChild(layout);
		dialog.addChild(client);
		dialog.addChild(details);
		dialog.showClose = false;
		dialog.show();
		file.refresh();
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
		document.body.appendChild(toaster.domNode);
		dojo.subscribe("configApply", function() {
			toaster.positionDirection = desktop.config.toasterPos;
		})
	}
}
