this.init = function(args) {
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.layout.SplitContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.Tree");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dojox.grid.Grid");
	dojo.require("dojo.data.ItemFileWriteStore");
	api.addDojoCss("dojox/grid/_grid/Grid.css");
	//I made this fake account to test it with...
	this.prefs = new api.registry({appid: this.id, name: "accounts", data: {
		identifier: 'id',
	        label: 'label',
	        items: [{
				id: 0,
				label: "Test AOL account",
				downHost: "imap.aol.com",
				downProtocol: "IMAP",
				downUsername: "rtemingbalm@aol.com",
				downPassword: "rickyman",
				upHost: "stmp.aol.com",
				upProtocol: "STMP",
				upUsername: "rtemingbalm@aol.com",
				upPassword: "rickyman"
		}]
	}});
	this.treeStore = new dojo.data.ItemFileWriteStore({data: {
		identifier: "name",
		label: "disp",
		items: []
	}});
	this.win = new api.window({
		title: "Email Clent",
		bodyWidget: "LayoutContainer",
		onClose: dojo.hitch(this, this.kill)
	});
	this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
	dojo.forEach([
		{label: "Refresh", onClick: dojo.hitch(this, this.refresh)}
	], function(args) {
		this.toolbar.addChild(new dijit.form.Button(args));
	}, this);
	this.win.addChild(this.toolbar);
	var split = new dijit.layout.SplitContainer({orientation: "horizontal", layoutAlign: "client"});
	var tree = new dijit.Tree({store: this.treeStore, onClick: dojo.hitch(this, this.onTreeClick)});
	split.addChild(tree);
	var main = new dijit.layout.SplitContainer({orientation: "vertical"});
	this.grid = new dojox.Grid({structure: [{
				cells: [[{name: "Read"}, {name: "Subject"}, {name: "Sender"}, {name: "Date"}]]
			}]});
	var cpane = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
	cpane.setContent(this.grid.domNode);
	main.addChild(cpane);
	this.msgArea = new dijit.layout.ContentPane();
	this.msgArea.setContent("test message");
	main.addChild(this.msgArea);
	split.addChild(main);
	this.win.addChild(split);
	this.win.show();
	this.win.startup();
	api.instances.setActive(this.instance);
	this.makeMailClasses();
}
this.mail = [];
this.makeMailClasses = function() {
	this.prefs.fetch({
		onComplete: dojo.hitch(this, function(items) {
			dojo.forEach(items, function(item) {
				this.mail.push({
					prefItem: item,
					down: new api.mail({
						host: this.prefs.getValue(item, "downHost"),
						username: this.prefs.getValue(item, "downUsername"),
						password: this.prefs.getValue(item, "downPassword"),
						protocol: this.prefs.getValue(item, "downProtocol")
					}),
					up: new api.mail({
						host: this.prefs.getValue(item, "upHost"),
						username: this.prefs.getValue(item, "upUsername"),
						password: this.prefs.getValue(item, "upPassword"),
						protocol: this.prefs.getValue(item, "upProtocol")
					})
				});
			}, this);
			this.refresh();
		})
	});
}
this.currentItem = null;
this.onTreeClick = function(item) {
	if(this.treeStore.getValue(this.currentItem, "name") != this.treeStore.getValue(item, "name")) {
		this.currentItem = item;
		this.updateUI();
	}
}
this.updateUI=function() {
	if(this.currentItem && this.treeStore.getValue(this.currentItem, "root") == false) {
		var folder = this.treeStore.getValue(this.currentItem, "name");
		var account = this.treeStore.getValue(this.currentItem, "parentAccount");
		var mailObj = false;
		for(key in this.mail) {
			if(this.prefs.getValue(this.mail[key].prefItem, "id") == account) {
				mailObj = this.mail[key].down;
				break;
			}
		}
		if(mailObj) {
			mailObj.listFolder({
				folder: folder,
				start: 0,
				end: 4,
				callback: dojo.hitch(this, function(data) {
					var p = new dojox.grid.data.Objects(data);
					this.grid.setModel(p);
				})
			});
		}
	}
}
this.folders = [];
this.refresh = function() {
	dojo.forEach(this.mail, function(mail) {
		this.treeStore.fetch({
			query: {name: "ROOT_"+this.prefs.getValue(mail.prefItem, "id")},
			scope: this,
			onComplete: function(items) {
				if(typeof items[0] == "undefined") {
					var rootitem = this.treeStore.newItem({
						name: "ROOT_"+this.prefs.getValue(mail.prefItem, "id"),
						disp: this.prefs.getValue(mail.prefItem, "label"),
						root: true,
						id: this.prefs.getValue(mail.prefItem, "id")
					});
				}
				else var rootitem = false;
				this._refreshHost(rootitem || items[0], mail);
			}
		});
	}, this);
}
this._refreshHost = function(rootitem, mail) {
	mail.down.countMessages("UNSEEN", dojo.hitch(this, function(f) {
		for(key in f) {
			if(!this.folders[key] || this.folders[key] < f[key]) {
				for(k in f) {
					this.treeStore.fetch({query: {name: k+"_"+this.treeStore.getValue(rootitem, "name")}, queryOptions: {deep: true}, scope: this, onComplete: function(item) {
						var label = k+(f[k] > 0 ? " ("+f[k]+")" : "");
						if(typeof item[0] == "undefined") {
							var newItem = this.treeStore.newItem({name: k+"_"+this.treeStore.getValue(rootitem, "name"), disp: label, parentAccount: this.treeStore.getValue(rootitem, "id"), root: false}, {parent: rootitem, attribute: "children"});
							if(this.currentItem === null) {
								this.currentItem = newItem;
							}
						}
						else {
							this.treeStore.setValue(item[0], "disp", label);
						}
					}});
				}
				this.updateUI();
				break;
			}
		}
	}));
}
this.kill = function() {
	if(!this.win.closed) this.win.close();
	this.treeStore.close();
	this.prefs.close();
	dojo.forEach(this.mail, function(mail) { mail.down.destroy(); mail.up.destroy(); });
	api.instances.setKilled(this.instance);
}