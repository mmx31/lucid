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
	if(!this.window.hidden) { this.window.hide(); }
	api.instances.setKilled(this.instance);
}
this.init = function(args) {
	this.open();
}
this.processUserName = function(username) {
	dojo.byId("userName"+this.instance).innerHTML = username;
}
this.processUserEmail = function(useremail) {
	dojo.byId("userEmail"+this.instance).innerHTML = useremail;
}
this.processUserID = function(userid) {
	dojo.byId("userID"+this.instance).innerHTML = userid;
}
this.processUserLevel = function(userlevel) {
	dojo.byId("userLevel"+this.instance).innerHTML = userlevel;
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
		onHide: dojo.hitch(this, this.kill)
	});
	this.window.title="Control Panel";
	this.window.width="620px";
	this.window.height="410px";
	this.window.setBodyWidget("LayoutContainer", {});
	var toolbar = new dijit.Toolbar({layoutAlign: "top"});
	toolbar.addChild(new dijit.form.Button({label: "About", onClick: dojo.hitch(this, this.about), iconClass: "icon-16-apps-help-browser"}));
	toolbar.addChild(new dijit.form.Button({label: "Save to server", onClick: dojo.hitch(this, this.processSave), iconClass: "icon-16-actions-document-save"}));
	this.window.addChild(toolbar);
	var tabs = new dijit.layout.TabContainer({layoutAlign: "client"}, document.createElement("div"));
		var wallpaper = new dijit.layout.ContentPane({title: "Wallpaper"}, document.createElement("div"));
		var winHTML = "<fieldset><legend>Color</legend>";
		winHTML += "<div id=\"colorThing"+this.instance+"\"></div>";
		winHTML += "<br /><br /><b>HTML Color:</b><div id=\"colorPick"+this.instance+"\"></div>";
		winHTML += "</fieldset>";
		winHTML += "<fieldset><legend>Background Image</legend>";
		winHTML += "Default<div id=\"radio1"+this.instance+"\"></div>None<div id=\"radio2"+this.instance+"\"></div>";
		winHTML += "<br /><b>Image URL: </b><input type='text' name='image"+this.instance+"' value='"+ desktop.config.wallpaper.image +"' id='image"+this.instance+"' />";
		winHTML += "</fieldset>"
		wallpaper.setContent(winHTML);
		tabs.addChild(wallpaper);

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

		var advanced = new dijit.layout.ContentPane({title: "Advanced"}, document.createElement("div"));
		winHTML = "debug: <div id=\"debug"+this.instance+"\"></div> <p> crosstalkPing:<span style=\"display: inline\" id=\"crosstalkPing"+this.instance+"\"></span><span id=\"buttonMaybe"+this.instance+"\"></span><p><b>debug:</b> an option that enables some advanced output and options.(dev only). <br> <b>crosstalkPing:</b> how often the desktop communicates with the server. (in miliseconds).";
		advanced.setContent(winHTML);
		tabs.addChild(advanced); 

	this.window.addChild(tabs);
	this.window.show();
	this.window.startup();
	api.instances.setActive(this.instance);
	new dijit.form.TextBox({id: "theme"+this.instance, name: "theme"+this.instance}, document.getElementById("theme"+this.instance));
	new dijit.ColorPalette({palette: "7x10", onChange: dojo.hitch(this, this.colorChange)}, document.getElementById("colorThing"+this.instance));
	new dijit.form.TextBox({id: "colorPick"+this.instance, name: "colorPick"+this.instance}, document.getElementById("colorPick"+this.instance));
	new dijit.form.TextBox({id: "oldPass"+this.instance, name: "oldPass"+this.instance}, document.getElementById("oldPass"+this.instance));
	new dijit.form.TextBox({id: "newPass"+this.instance, name: "newPass"+this.instance}, document.getElementById("newPass"+this.instance));
	new dijit.form.TextBox({id: "newPassConfirm"+this.instance, name: "newPassConfirm"+this.instance}, document.getElementById("newPassConfirm"+this.instance));
	new dijit.form.TextBox({id: "image"+this.instance, name: "image"+this.instance}, document.getElementById("image"+this.instance));
	new dijit.form.RadioButton({checked: false, name:"radiobutton",id:"radio1"+this.instance}, document.getElementById("radio1"+this.instance));
	new dijit.form.RadioButton({checked: false, name:"radiobutton",id:"radio2"+this.instance}, document.getElementById("radio2"+this.instance));
	new dijit.form.CheckBox({name:"fx"+this.instance, id:"fx"+this.instance}, document.getElementById("bbbbb"+this.instance));
	new dijit.form.CheckBox({name:"debug"+this.instance, id:"debug"+this.instance}, document.getElementById("debug"+this.instance));
	new dijit.form.TextBox({id: "crosstalkPing"+this.instance, name: "crosstalkPing"+this.instance}, document.getElementById("crosstalkPing"+this.instance));
	new dijit.form.TextBox({id: "email"+this.instance, name: "email"+this.instance}, document.getElementById("email"+this.instance));
	dijit.byId("colorPick"+this.instance).setValue(desktop.config.wallpaper.color);
	dijit.byId("theme"+this.instance).setValue(desktop.config.theme);
	dijit.byId("image"+this.instance).setValue(desktop.config.wallpaper.image);
	dijit.byId("fx"+this.instance).setChecked(desktop.config.fx);
	dijit.byId("debug"+this.instance).setChecked(desktop.config.debug);
	dijit.byId("crosstalkPing"+this.instance).setValue(desktop.config.crosstalkPing);
	api.user.getUserName(dojo.hitch(this, this.processUserName));
	api.user.getUserID(dojo.hitch(this, this.processUserID));
	api.user.getUserLevel(dojo.hitch(this, this.processUserLevel));
	api.user.getUserEmail(dojo.hitch(this, this.processUserEmail));
	desktop.theme.list(dojo.hitch(this, this.processThemes));
}
this.radioButton = function(a) {
	alert(a);
}
this.colorChange = function(color) {
	dijit.byId("colorPick"+this.instance).setValue(color);
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
	var image=dijit.byId("image"+this.instance).getValue();
	var color=dijit.byId("colorPick"+this.instance).getValue();
	var fx=dijit.byId("fx"+this.instance).checked;
	var theme=dijit.byId("theme"+this.instance).getValue();
	var debug=dijit.byId("debug"+this.instance).checked;
	var crosstalkPing=dijit.byId("crosstalkPing"+this.instance).getValue();
	desktop.theme.set(theme);
	dojo.byId("currentTheme"+this.instance).innerHTML = theme;
	desktop.wallpaper.set(image);
	desktop.wallpaper.setColor(color);
	desktop.config.debug = debug;
	desktop.config.crosstalkPing = parseInt(crosstalkPing);
	desktop.config.wallpaper.image = image;
	desktop.config.wallpaper.color = color;
	desktop.config.fx = fx;
	desktop.config.save();
	api.ui.alertDialog({title: "Notice", message: "Changes were applied successfully."});
	api.user.getUserName(dojo.hitch(this, this.processUserName));
	api.user.getUserID(dojo.hitch(this, this.processUserID));
	api.user.getUserLevel(dojo.hitch(this, this.processUserLevel));
	api.user.getUserEmail(dojo.hitch(this, this.processUserEmail));
}	