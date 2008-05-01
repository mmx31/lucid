dojo.provide("desktop.apps.Terminal");

dojo.declare("desktop.apps.Terminal", desktop.apps._App, {
	init: function(args)
	{
		dojo.require("dijit.layout.LayoutContainer");
		dojo.requireLocalization("desktop", "apps");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.win = new api.Window({
			title: app["Terminal"],
			onClose: dojo.hitch(this, "kill")
		});
		this.term = new api.Console({layoutAlign: "client", path: (args.path || "/")})
		this.term.aliases.exit = dojo.hitch(this, "kill");
		this.win.addChild(this.term);
		this.win.show();
		this.win.startup();
	},
	
	kill: function() {
		if(!this.win.closed) { this.win.close(); }
	}
})