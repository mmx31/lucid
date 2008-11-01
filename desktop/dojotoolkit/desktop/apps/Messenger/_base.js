dojo.provide("desktop.apps.Messenger._base");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop", "messages");
dojo.requireLocalization("desktop.apps.Messenger", "Strings");

dojo.declare("desktop.apps.Messenger", desktop.apps._App, {
	init: function(args) {
		if(!this.prepare()) { this.kill(true); return false; } //Already running?
		this._draw = !this.crosstalk; //Are we drawing the UI, or is this a launch from crosstalk?
		if(this._draw)
			desktop.user.get({callback: dojo.hitch(this, this.drawUI)}); //OH YA WE ARE DRAW UI
        },
	prepare: function() {
		var instances = desktop.app.getInstances();
		for(var i=0;i<instances.length;i++) {
			//One instance at a time.. please.
			if(instances[i].sysname == this.sysname && instances[i].instance != this.instance) {
				if(!instances[i]._draw)
					desktop.user.get({callback: dojo.hitch(this, instances[i].drawUI)});
				return false;
			}
		}
		this.session = desktop.crosstalk.subscribe("instantmessaging", dojo.hitch(this, this.incoming), this.instance); //Register crosstalk session and register 'instantmessaging' topics to this application+instance.
		return true;
	},
	incoming: function(messagedata) {
		var nls = dojo.i18n.getLocalization("desktop.apps.Messenger", "Strings");
		if(messagedata.type == "plaintext") { //Just a pager message?
			desktop.user.get({id: messagedata._crosstalk.sender, callback: dojo.hitch(this, function(details) {
				desktop.dialog.alert({title: nls.newMessage, message: nls.from + " " + details.username + " <i>" + nls.uid + ": " + messagedata._crosstalk.sender + "</i><br>" + nls.message + "<p>" + messagedata.message});
			})});
		}
		if(messagedata.type == "im") { //Or an IM session?
			//lolsoon
		}
	},
	send: function(type) {
		var nls = dojo.i18n.getLocalization("desktop.apps.Messenger", "Strings");
		if(type == 'im') {
			desktop.dialog.alert({title: nls.intm, message: nls.not});
			return false;
		}
		if(type == 'plaintext') {
			desktop.dialog.input({title: nls.intm, message: nls.userid, callback: dojo.hitch(this, function(ans) {
				if(ans === false) return;
				desktop.dialog.input({title: nls.intm, message: nls.messageSend, callback: dojo.hitch(this, function(anss) {
					if(anss === false) return;
					desktop.crosstalk.publish("instantmessaging", {type: "plaintext", message: anss}, ans, "Messenger");
				})});
			})});
		}
	},
	drawUI: function(details) {
		var nls = dojo.i18n.getLocalization("desktop.apps.Messenger", "Strings");
		this.windows = [];
		var win = this.window = new desktop.widget.Window({
                    title: "Internal Messenger",
                    width: "240px",
                    height: "160px",
                    iconClass: this.iconClass,
		    onClose: dojo.hitch(this, "kill")
                });
		var top = this.header = new dijit.layout.ContentPane({
                    region: "center"
                });
		var row1 = document.createElement("div");
		var row2 = document.createElement("div");
		var row3 = document.createElement("div");
		row1.innerHTML = "<h1>"+nls.intm+"</h1>";
		var button = new dijit.form.Button({
		    label: nls.sendMessage,
		    onClick: dojo.hitch(this, function() {
				this.send("plaintext");
		    })
		});
		row2.appendChild(button.domNode);
		var button = new dijit.form.Button({
		    label: nls.startIM,
		    onClick: dojo.hitch(this, function() {
				this.send("im");
		    })
		});
		row2.appendChild(button.domNode);
		row3.innerHTML = '<i>' + nls.uuid + ' ' + details.id + '</i>';
		var main = document.createElement("div"); main.appendChild(row1); main.appendChild(row2);  main.appendChild(row3);
		top.setContent(main);
                win.addChild(top);
		win.show();
		win.startup();
		this.windows.push(win);
	},
	kill: function(stright) {
		if(stright) return; //If closing abnormally, skip this.
		dojo.forEach(this.windows, function(win) {
		    if(!win.closed)
		        win.close();
		});
		desktop.crosstalk.unsubscribe(this.session); //Tell crosstalk we are no longer intrested in recieving events.
	}
});
