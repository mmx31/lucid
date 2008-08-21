dojo.provide("desktop.ui.applets.Twitter");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Textarea");
dojo.require("dojox.validate.web");
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
		if(!this.settings.username)
			this.drawLoginForm();
		else
			this.getInfo();
	},
	uninitialize: function() {
		clearTimeout(this.timer);
	},
	drawLoginForm: function(error) {
		for(var key in this.loginUi) {
			this.loginUi[key].destroy();
		}
		if(this.settings.username)
			delete this.settings.username;
		var actNls = dojo.i18n.getLocalization("desktop.ui", "accountInfo");
		var div = document.createElement("div");
		if(error) {
			var messageNode = document.createElement("div");
			dojo.style(messageNode, "textAlign", "center");
			api.textContent(messageNode, actNls.authFail)
			div.appendChild(messageNode);
		}
		dojo.forEach(["username", "password"], function(label) {
			var row = document.createElement("div");
			api.textContent(row, actNls[label]+": ");
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
				username: this.settings.username
			}
		}
		this.timer = setTimeout(dojo.hitch(this, "getInfo"), 1000*60*5);
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
				username: this.loginUi.username.getValue()
			});
			this.loginUi.username.setValue("");
			this.loginUi.password.setValue("");
		}
		if(!this.contentNode) {
			var main = document.createElement("div");
			this.makeTextbox(main);
			this.contentNode = document.createElement("div");
			main.appendChild(this.contentNode);
			this.dialog.setContent(main);
		}
		var div = this.contentNode;
		div.innerHTML = "";
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
			var text = "";
			var items=item.text.split("\n")
			var allItems = [];
			for(var i in items) {
				var newItems = items[i].split(" ");
				dojo.forEach(newItems, function(item) { allItems.push(item); });
			}
			dojo.forEach(allItems, function(item) {
				if(dojox.validate.isUrl(item) && parseInt(item.charAt(0)).toString() == "NaN")
					text += "<a href='"+item+"'>"+(item.length >= 28 ? item.substring(0, 28)+"..." : item)+"</a> ";
				else
					text += item+" "
			});
			row.innerHTML = "<img width=32 height=32 style='width: 32px; height: 32px; margin-right: 5px; float: left;' src='"+item.user.profile_image_url+"' />"
							+"<a href='http://twitter.com/"+item.user.screen_name+"'>"+item.user.name+"</a> "
							+text
							+"<a href='http://www.twitter.com/"+item.user.screen_name+"/statuses/"+item.id+"'>"
							+dojo.date.locale.format(date)+"</a>";
			dojo.query("a", row).forEach(function(node) {
				dojo.connect(node, "onclick", node, function(e) {
					if(!e.shiftKey
					&& !e.ctrlKey) {
						desktop.app.launchHandler(null, {url: this.href}, "text/x-uri");
						e.preventDefault();
					}
				})
			});
			div.appendChild(row);
		})
	},
	makeTextbox: function(div) {
		var header = document.createElement("div");
		dojo.style(header, "position", "relative");
		api.textContent(header, "What are you doing?");
		var counter = document.createElement("div");
		dojo.style(counter, {
			position: "absolute",
			top: "0px",
			right: "0px"
		});
		api.textContent(counter, "140");
		header.appendChild(counter);
		div.appendChild(header);
		var area = document.createElement("div");
		var button = new dijit.form.Button({
			label: "Update",
			onClick: dojo.hitch(this, function() {
				this.postUpdate(this.textbox.getValue());
			})
		});
		var tb = this.textbox = new dijit.form.Textarea({
			intermediateChanges: true,
			style: "width: 300px;",
			onChange: function(value) {
				var length = value.split("").length;
				api.textContent(counter, 140-length);
				button.setDisabled(length >= 140);
			}
		});
		area.appendChild(tb.domNode);
		div.appendChild(area);
		
		var bRow = document.createElement("div");
		dojo.style(bRow, "textAlign", "center");
		bRow.appendChild(button.domNode);
		div.appendChild(bRow);
		
	},
	postUpdate: function(string) {
		if(string == "") return;
		api.xhr({
			xsite: true,
			url: "http://twitter.com/statuses/update.json",
			content: {
				status: string
			},
			auth: {
				username: this.settings.username,
			},
			load: dojo.hitch(this, function() {
				this.textbox.setValue("");
				this.getInfo();
			}),
			handleAs: "json"
		})
	}
});