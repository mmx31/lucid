dojo.require("dojo.parser");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.ColorPalette");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.Toolbar");
this.kill = function() {
	if(!this.window.closed) { this.window.close(); }
}
this.init = function(args) {
	this.open();
}
this.processUser = function(blah) {
	dojo.byId("userName"+this.instance).innerHTML = blah.username;
	dojo.byId("userEmail"+this.instance).innerHTML = blah.email;
	dojo.byId("userID"+this.instance).innerHTML = blah.id;
	dojo.byId("userLevel"+this.instance).innerHTML = blah.level;
}
this.processThemes = function(theme) {
	output = "";
	for(x=0;x<theme.length;x++) {
	if(typeof(theme[x]) != "undefined") {
		output += "<li>"+theme[x]+"</li><br>";
	}
	}
	dojo.byId("themeList"+this.instance).innerHTML = output;
}
this.open = function(args)
{
	this.window = new api.window({
		onClose: dojo.hitch(this, this.kill)
	});
	this.window.title="Control Panel";
	this.window.width="620px";
	this.window.height="410px";
	var toolbar = new dijit.Toolbar({layoutAlign: "top"});
	toolbar.addChild(new dijit.form.Button({label: "About", onClick: dojo.hitch(this, this.about), iconClass: "icon-16-apps-help-browser"}));
	toolbar.addChild(new dijit.form.Button({label: "Save to server", onClick: dojo.hitch(this, this.processSave), iconClass: "icon-16-actions-document-save"}));
	this.window.addChild(toolbar);
	var tabs = new dijit.layout.TabContainer({layoutAlign: "client"}, document.createElement("div"));

		var themes = new dijit.layout.ContentPane({title: "Themes"}, document.createElement("div"));
		winHTML = "Current theme: <span id=\"currentTheme"+this.instance+"\">"+desktop.config.theme+"</span> theme.<br><br><fieldset><legend>Change theme</legend>Theme Name: <input type=\"text\" name=\"theme"+this.instance+"\" id=\"theme"+this.instance+"\" value=\""+desktop.config.theme+"\"></fieldset><p><p><fieldset><legend>Installed Themes</legend><span id=\"themeList"+this.instance+"\">obtaining...</span></fieldset>";
		themes.setContent(winHTML);
		tabs.addChild(themes);

		var performance = new dijit.layout.ContentPane({title: "Performance"}, document.createElement("div"));
		winHTML = "Effects: <input checked type='checkbox' value='true' name='bbbbb' id='bbbbb"+this.instance+"'><br><br>Disabling effects can have a major speed boost on a slow machine. <br> If you have a high-end machine, you are recommended to leave effects on."; 
		performance.setContent(winHTML);
		tabs.addChild(performance);

		var account = new dijit.layout.ContentPane({title: "Account Details"}, document.createElement("div"));
		winHTML = "Account details: <br><b>UserID:</b> <span id=\"userID"+this.instance+"\">obtaining...</span><br><b>Username:</b> <span id=\"userName"+this.instance+"\">obtaining...</span><br><b>E-mail:</b> <span id=\"userEmail"+this.instance+"\">obtaining...</span><br><b>Password:</b> (hidden)<br><b>Userlevel:</b> <span id=\"userLevel"+this.instance+"\">obtaining...</span>"; 
		account.setContent(winHTML);
		tabs.addChild(account);

		var password = new dijit.layout.ContentPane({title: "Change Details"}, document.createElement("div"));
		winHTML = "Current Password: <span id=\"oldPass"+this.instance+"\"></span><br>(To authenticate any changes on this page you need to insert this) <p> New Password: <span id=\"newPass"+this.instance+"\"></span><br>New Password (Confirm):<span id=\"newPassConfirm"+this.instance+"\"></span><p>E-mail:<span id=\"email"+this.instance+"\"></span><div id=\"buttonMaybe"+this.instance+"\"></div>";
		password.setContent(winHTML);
		tabs.addChild(password); 

	this.window.addChild(tabs);
	this.window.show();
	this.window.startup();
	new dijit.form.TextBox({id: "theme"+this.instance, name: "theme"+this.instance}, document.getElementById("theme"+this.instance));
	new dijit.form.TextBox({id: "oldPass"+this.instance, name: "oldPass"+this.instance}, document.getElementById("oldPass"+this.instance));
	new dijit.form.TextBox({id: "newPass"+this.instance, name: "newPass"+this.instance}, document.getElementById("newPass"+this.instance));
	new dijit.form.TextBox({id: "newPassConfirm"+this.instance, name: "newPassConfirm"+this.instance}, document.getElementById("newPassConfirm"+this.instance));
	new dijit.form.CheckBox({name:"fx"+this.instance, id:"fx"+this.instance}, document.getElementById("bbbbb"+this.instance));
	new dijit.form.TextBox({id: "email"+this.instance, name: "email"+this.instance}, document.getElementById("email"+this.instance));
	dijit.byId("theme"+this.instance).setValue(desktop.config.theme);
	dijit.byId("fx"+this.instance).setChecked(desktop.config.fx);
	api.user.get({callback: dojo.hitch(this, this.processUser)});
	desktop.theme.list(dojo.hitch(this, this.processThemes));
}
this.about = function() {
	api.ui.alertDialog({title: "Control Panel", message:"Psych Desktop Control Panel<br>Version "+this.version});
}
this.processSave = function() {
	var old = dijit.byId("oldPass"+this.instance).getValue();
	var newa = dijit.byId("newPass"+this.instance).getValue();
	var newConfirm = dijit.byId("newPassConfirm"+this.instance).getValue();
	var email = dijit.byId("email"+this.instance).getValue();
	if(old != "") {
		if(newa != newConfirm) { 
			api.ui.alertDialog({title: "Error", message:"New password and new confirm password do not match."});
			return false; 
		}
		if(email != "") { desktop.user.changeUserEmail({old: old, newemail: email, callback: function(a) {
		if(a == 1) {
		api.ui.alertDialog({title:"E-mail Change Result", message: "E-mail change unsucessful. Check that password is correct."});
		}
		else {
		api.ui.alertDialog({title:"E-mail Change Result", message: "E-mail changed."});
		}
		}});}
		if(newa != "") { desktop.user.changeUserPassword({old: old, newpass: newa, callback:function(a) {
		if(a == 1) {
		api.ui.alertDialog({title:"Password Change Result", message: "Password change unsuccessful. Check that your old password is correct."});
		}
		else {
		api.ui.alertDialog({title:"Password Change Result", message: "Password change successful."});
		}
		}});}
		dijit.byId("oldPass"+this.instance).setValue("");
		dijit.byId("newPass"+this.instance).setValue("");
		dijit.byId("newPassConfirm"+this.instance).setValue("");
		dijit.byId("email"+this.instance).setValue("");
	}
	var fx=dijit.byId("fx"+this.instance).checked;
	var theme=dijit.byId("theme"+this.instance).getValue();
	desktop.theme.set(theme);
	dojo.byId("currentTheme"+this.instance).innerHTML = theme;
	desktop.config.fx = fx;
	desktop.config.save();
	desktop.config.apply();
	api.ui.alertDialog({title: "Notice", message: "Changes were applied successfully."});
	api.user.getUserName(dojo.hitch(this, this.processUserName));
	api.user.getUserID(dojo.hitch(this, this.processUserID));
	api.user.getUserLevel(dojo.hitch(this, this.processUserLevel));
	api.user.getUserEmail(dojo.hitch(this, this.processUserEmail));
}	
