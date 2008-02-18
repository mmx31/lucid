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

	this.window.addChild(tabs);
	this.window.show();
	this.window.startup();
	new dijit.form.TextBox({id: "theme"+this.instance, name: "theme"+this.instance}, document.getElementById("theme"+this.instance));
	dijit.byId("theme"+this.instance).setValue(desktop.config.theme);
	desktop.theme.list(dojo.hitch(this, this.processThemes));
}
this.about = function() {
	api.ui.alertDialog({title: "Control Panel", message:"Psych Desktop Control Panel<br>Version "+this.version});
}
this.processSave = function() {
	var theme=dijit.byId("theme"+this.instance).getValue();
	desktop.theme.set(theme);
	dojo.byId("currentTheme"+this.instance).innerHTML = theme;
	desktop.config.save();
	desktop.config.apply();
	api.ui.alertDialog({title: "Notice", message: "Changes were applied successfully."});
}	
