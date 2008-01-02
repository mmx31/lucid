this.init = function(args)
{
	dojo.require("dijit.layout.LayoutContainer");
	this.win = new api.window({
		title: "Terminal",
		bodyWidget: "LayoutContainer",
		onHide: dojo.hitch(this, this.kill)
	});
	this.term = new api.console({layoutAlign: "client", path: (args.path || "/")})
	this.term.aliases.exit = dojo.hitch(this, this.kill);
	this.win.addChild(this.term);
	this.win.show();
	this.win.startup();
	this.win.onDestroy = dojo.hitch(this, this.kill);
	api.instances.setActive(this.instance);
}

this.kill = function() {
	if(!this.win.hidden) { this.win.hide(); }
	api.instances.setKilled(this.instance);
}