dojo.provide("api.ui");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.widget.Toaster");
dojo.requireLocalization("desktop", "common");

api.ui = {
	//	summary:
	//		An API that provides things like dialogs and such
	alertDialog: function(/*Object*/object)
	{
		//	summary:
		//		Shows a simple alert dialog
		//	object: {title: String}
		//		the title of the dialog
		//	object: {message: String}
		//		the message to be shown in the body of the window
		//	object: {callback: Function?}
		//		a callback that is called when the dialog is closed
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.innerHTML = "<center> "+(object.message||"")+" </center>";
		var box = new dijit.Dialog({title: object.title, style: object.style || ""}, div);
		box.show();
		if(object.callback) {
			dojo.connect(box, 'onUnload', object.callback);
		}
	},
	authenticationDialog: function(/*Object*/object)
	{
		//	summary:
		//		Shows a simple authentication dialog
		//	object: {permission: String}
		//		The permission to authenticate
		//	object: {program: String?}
		//		The program that wants this authentication (for UI only)
		//	object: {callback: Function}
		//		Will return 0 or 1 to this when authenticated
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
		var top = new dijit.layout.ContentPane({region: "top", style: "padding: 20px;"});
		top.setContent(ac.sudoExplanation);
		var client = new dijit.layout.ContentPane({region: "center", style: "padding: 40px;"});
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
		api.textContent(row4, ac.attemptsRemaining+": ");
		row3.innerHTML = times;
		row4.appendChild(row3);
		var main = document.createElement("div"); main.appendChild(row1); main.appendChild(row2); main.appendChild(row4);
		client.setContent(main);
		var bottom = new dijit.layout.ContentPane({region: "bottom", style: "padding: 20px;"});
		bottom.setContent(ac.program+": "+object.program+"<br />"+ac.action+": "+object.permission+"<br />"+ac.vendor+": "+ac.unknown);
		dojo.forEach([top, bottom, client], function(e) {
			win.addChild(e);
		});
		win.show();
		win.startup();
		}
				
	},
	inputDialog: function(/*Object*/object)
	{
		//	summary:
		//		A dialog with a text field
		//	object: {title: String}
		//		the title of the dialog
		//	object: {message: String}
		//		a message to display above the text field and buttons
		//	object: {initial: String}
		//		the initial contents of the dialog
		//	object: {callback: Function?}
		//		a callback function. The first argument is the inputted string if the user clicked OK, but false if the user clicked cancel or closed the window.
		//	example:
		//	|	api.ui.inputDialog({title: "UI Test", message: "What is your name?", callback: api.log});
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var dialog = new api.Window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function() {object.callback(false)});
		var details = new dijit.layout.ContentPane({region: "center"}, document.createElement("div"));
		var text = new dijit.form.TextBox({value: object.initial || ""});
		all = document.createElement("div");
		var blah = new dijit.form.Button({label: cm.ok, onClick: dojo.hitch(this, function() {  dojo.disconnect(onClose); object.callback(text.getValue()); dialog.close(); })});
		var ablah = new dijit.form.Button({label: cm.cancel, onClick: dojo.hitch(this, function() {  dojo.disconnect(onClose); object.callback(false); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+(object.message||"")+"</center>";
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
	},
	yesnoDialog: function(/*Object*/object)
	{
		//	summary:
		//		A yes or no dialog
		//	object: {title: String}
		//		the title of the dialog
		//	object: {message: String}
		//		a message to display above the yes/no buttons
		//	object: {callback: Function?}
		//		a callback function. The first argument is true if the user clicked yes, and false if the user clicked no or closed the window.
		//	example:
		//	|	api.ui.yesnoDialog({title: "UI Test", message: "Did you sign your NDA?", callback: function(p) {
		//	|		if(p) alert("Good for you!");
		//	|		else alert("Then sign it allready!");
		//	|	});
		
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var dialog = new api.Window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function() {object.callback(false)});
		var details = new dijit.layout.ContentPane({region: "center"}, document.createElement("div"));
		all = document.createElement("div");
		var blah = new dijit.form.Button({label: cm.yes, onClick: dojo.hitch(this, function() { dojo.disconnect(onClose); object.callback(true); dialog.close(); })});
		var ablah = new dijit.form.Button({label: cm.no, onClick: dojo.hitch(this, function() { dojo.disconnect(onClose); object.callback(false); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+(object.message||"")+"</center>";
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
	},
	fileDialog: function(/*Object*/object)
	{
		//	summary:
		//		Shows a file selector dialog
		//	object: {title: String}
		//		the title of the dialog
		//	object: {types: Array?}
		//		array which contains an object. e.g types[0].type = "txt"; types[0].label = ".txt (Text)";
		//	object: {callback: Function?}
		//		a callback function. returns the path to the file/folder selected as a string
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
		var toolbar = new dijit.Toolbar({region: "top"});
		var layout = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
		var button = new dijit.form.Button({
			onClick: dojo.hitch(file, "setPath", "file://"),
			iconClass: "icon-16-places-user-home",
			label: pl.Home
		});
		toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(file, "up"),
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
		dialog.addChild(toolbar);
		var client = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 70, region: "center"});
		var pane = new dijit.layout.ContentPane({sizeMin: 125}, document.createElement("div"));
		var details = new dijit.layout.ContentPane({region: "bottom"}, document.createElement("div"));
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
		if(object.types) {
			var store = this.internalStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "type",
					label: "label",
					items: object.types
				}
			});
			store.newItem({type: "", label: ""});
			var select = new dijit.form.FilteringSelect({
				store: store
			});
		}
		var button = new dijit.form.Button({label: cm.loadOrSave, onClick: dojo.hitch(this, function() { 
			dojo.forEach(file.getChildren(), function(item) {
				if(item.type=="text/directory") {
					if(file.path+item.name == address.getValue()) {
						file.setPath(file.path+item.name);
						return;
					}
				}
				else {
					if(file.path+item.name == address.getValue()) {
						object.callback(file.path+item.name);
						dialog.close();
						return;
					}
				}		
			});
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
		line.appendChild(address.domNode);
		if(object.types) line.appendChild(select.domNode);
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
	},
	notify: function(/*String|Object*/message)
	{
		//	summary:
		//		Show a toaster popup (similar to libnotify)
		//	message:
		//		the message to show. If an object is passed, it takes three parameters.
		//	message: {message: String}
		//		the message to show
		//	message: {type: String?}
		//		type of message. Can be "message", "warning", "error", or "fatal"
		//	message: {duration: Integer?}
		//		how long should the message be displayed in milliseconds
		dojo.publish("desktop_notification", [message]);
	},
	init: function() {
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
