dojo.provide("desktop.ui.applets.Twitter");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Dialog");
dojo.require("dojox.encoding.crypto.Blowfish");
dojo.requireLocalization("desktop.ui", "accountInfo");
dojo.requireLocalization("desktop", "common");

dojo.declare("desktop.ui.applets.Twitter", desktop.ui.Applet, {
	dispName: "Twitter",
	loginUi: {},
	postCreate: function() {
		var dialog = this.dialog = new dijit.TooltipDialog({});
		var button = new dijit.form.DropDownButton({
			dropDown: dialog,
			label: "Twitter"
		});
		this.addChild(button);
		this.inherited("postCreate", arguments);
	},
	startup: function() {
		if(!this.settings.key)
			this.settings.key = dojox.encoding.crypto.Blowfish.encrypt(Math.random(), Math.random());
		if(!this.settings.username) {
			this.drawLoginForm();
		}
	},
	drawLoginForm: function(error) {
		for(var key in this.loginUi) {
			this.loginUi[key].destroy();
		}
		var actNls = dojo.i18n.getLocalization("desktop.ui", "accountInfo");
		var div = document.createElement("div");
		if(error) {
			var messageNode = document.createElement("div");
			dojo.style(messageNode, "textAlign", "center");
			messageNode.textContent = actNls.authFail;
			div.appendChild(messageNode);
		}
		dojo.forEach(["username", "password"], function(label) {
			var row = document.createElement("div");
			row.textContent = actNls[label]+": ";
			var textbox = this.loginUi[label] = new dijit.form.TextBox({
				type: (label == "password" ? "password" : "text")
			});
			row.appendChild(textbox.domNode);
			div.appendChild(row);
		}, this);
		var cmnNls = dojo.i18n.getLocalization("desktop", "common");
		var submit = new dijit.form.Button({
			label: cmnNls.login,
			onClick: dojo.hitch(this, "getInfo")
		});
		var row = document.createElement("div");
		dojo.style(row, "textAlign", "center");
		row.appendChild(submit.domNode);
		div.appendChild(row);
		this.dialog.setContent(div);
	},
	getInfo: function() {
		console.log(this.settings);
		if(!this.settings.username) {
			var authInfo = {
				username: this.loginUi.username.getValue(),
				password: this.loginUi.password.getValue()
			}
			
		}
		else {
			var authInfo = {
				username: dojox.encoding.crypto.Blowfish.decrypt(this.settings.username, this.settings.key),
				password: dojox.encoding.crypto.Blowfish.decrypt(this.settings.password, this.settings.key)
			}
		}
		api.xhr({
			xsite: true,
			url: "http://twitter.com/statuses/friends_timeline.json",
			auth: authInfo,
			load: dojo.hitch(this, "drawInfo"),
			error: dojo.hitch(this, "drawLoginForm", true),
			handleAs: "json"
		})
	},
	drawInfo: function(data) {
		if(!this.settings.username) {
			this.settings = dojo.mixin(this.settings, {
				username: dojox.encoding.crypto.Blowfish.decrypt(this.loginUi.username.getValue(), this.settings.key),
				password: dojox.encoding.crypto.Blowfish.decrypt(this.loginUi.password.getValue(), this.settings.key)
			});
			this.loginUi.username.setValue("");
			this.loginUi.password.setValue("");
		}
		var div = document.createElement("div");
		dojo.forEach(data, function(item) {
			var row = document.createElement("div");
			row.innerHTML = item.text;
			div.appendChild(row);
		})
		this.dialog.setContent(div);
	}
});