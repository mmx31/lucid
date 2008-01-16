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
	            items: [
					{id: 0, label: "Test AOL account", host: "imap.aim.com", protocol: "IMAP", username: "rtemingbalm@aol.com", password: "rickyman"}
				]
	        }
	});
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
	var tree = new dijit.Tree({store: this.treeStore});
	split.addChild(tree);
	var main = new dijit.layout.SplitContainer({orientation: "vertical"});
	this.grid = new dojox.Grid();
	main.addChild(this.grid);
	this.msgArea = new dijit.layout.ContentPane();
	this.msgArea.setContent("test message");
	main.addChild(this.msgArea);
	split.addChild(main);
	this.win.addChild(split);
	this.win.show();
	this.win.startup();
	api.instances.setActive(this.instance);
}
this.mail = [];
this.makeMailClasses = function() {
	this.prefs.fetch({
		onComplete: dojo.hitch(this, function(items) {
			this.mail.push(new api.mail()); //TODO: add account info to class
		})
	});
}
this.updateUI=function() {
	//TODO: here we would update the grid
}
this.folders = [];
this.refresh = function() {
	this.prefs
	this.mail.countMessages("UNSEEN", dojo.hitch(this, function(f) {
		for(key in f) {
			if(!this.folders[key] || this.folders[key] < f[key]) {
				this.updateUI();
				for(k in f) {
					this.treeStore.fetchItemByIdentity({identity: k, scope: this, onItem: function(item) {
						var label = key+(f[k] > 0 ? " ("+f[k]+")" : "");
						if(item === null) {
							this.treeStore.newItem({name: k, disp: label});
						}
						else {
							this.treeStore.setValue(item, "disp", label);
						}
					}});
				}
				break;
			}
		}
	}));
}
this.kill = function() {
	if(!this.win.closed) this.win.close();
	this.treeStore.close();
	this.mail.destroy();
	api.instances.setKilled(this.instance);
}