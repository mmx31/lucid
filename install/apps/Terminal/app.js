this.init = function(args)
{
	dojo.require("dijit.layout.LayoutContainer");
	dojo.requireLocalization("desktop", "apps");
	var app = dojo.i18n.getLocalization("desktop", "apps");
	this.win = new api.Window({
		title: app["Terminal"],
		onClose: dojo.hitch(this, this.kill)
	});
	this.term = new api.Console({layoutAlign: "client", path: (args.path || "/")})
	this.term.aliases.exit = dojo.hitch(this, this.kill);
	this.win.addChild(this.term);
	this.win.show();
	this.win.startup();
	this.win.onDestroy = dojo.hitch(this, this.kill);
}

this.kill = function() {
	if(!this.win.closed) { this.win.close(); }
}
