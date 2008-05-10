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
		if(!this.settings.username)
			this.drawLoginForm();
		else
			this.getInfo();
		this.timer = setInterval(dojo.hitch(this, "getInfo"), 1000*60*5);
	},
	uninitialize: function() {
		clearInterval(this.timer);
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
				username: dojox.encoding.crypto.Blowfish.encrypt(this.loginUi.username.getValue(), this.settings.key),
				password: dojox.encoding.crypto.Blowfish.encrypt(this.loginUi.password.getValue(), this.settings.key)
			});
			this.loginUi.username.setValue("");
			this.loginUi.password.setValue("");
		}
		var div = document.createElement("div");
		var count = 0;
		dojo.forEach(data, function(item) {
			if(count++ > 5) return;
			var row = document.createElement("div");
			dojo.style(row, {
				width: "300px",
				padding: "5px",
				backgroundColor: (count % 2 ? "white" : "#eee")
			});
			var date = new Date(item.created_at);
			row.innerHTML = "<img width=32 height=32 style='width: 32px; height: 32px; margin-right: 5px; float: left;' src='"+item.user.profile_image_url+"' />"
							+"<a href='http://twitter.com/"+item.user.screen_name+"'>"+item.user.name+"</a> "
							+item.text
							+" <a href='http://www.twitter.com/"+item.user.screen_name+"/statuses/"+item.id+"'>"
							+dojo.date.locale.format(date)+"</a>";
			dojo.query("a", row).forEach(function(node) {
				node.href="javascript:desktop.app.launchHandler(null, {url: \"" + escape(node.href) + "\"}, \"text/x-uri\")";
			});
			div.appendChild(row);
		})
		this.dialog.setContent(div);
	}
});