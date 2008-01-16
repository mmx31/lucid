this.init = function(args) {
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.layout.SplitContainer");
	dojo.require("dijit.Tree");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.data.ItemFileWriteStore");
	
	this.store = new dojo.data.ItemFileWriteStore({data: {
		identifier: "name",
		label: "disp",
		items: []
	}});
	this.mail = new api.mail({host: "", protocol: "IMAP", username: "", password: ""});
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
	var split = new dijit.layout.SplitContainer({orientation: "vertical", layoutAlign: "client"});
	var tree = new dijit.Tree({store: this.store});
	split.addChild(tree);
	this.win.addChild(split);
	this.win.show();
	this.win.startup();
	api.instances.setActive(this.instance);
}
this.refresh = function() {
	this.store.fetch({query:{name:"*"}, onComplete: dojo.hitch(this, function(data) {
		dojo.forEach(data, function(item) { console.log(item); if(this.store.isItem(item)) this.store.deleteItem(item); console.log(item); }, this);
		this.mail.countMessages("UNSEEN", dojo.hitch(this, function(data){
			for(key in data) {
				console.log(key);
				this.store.newItem({name: key, disp: key+(data[key] > 0 ? " ("+data[key]+")" : "")});
			}
		}));
	})});
}
this.kill = function() {
	if(!this.win.closed) this.win.close();
	this.store.close();
	this.mail.destroy();
	api.instances.setKilled(this.instance);
}