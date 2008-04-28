dojo.provide("desktop.ui.applets.Netmonitor");
dojo.require("dijit.Tooltip");
dojo.requireLocalization("desktop", "system");
dojo.requireLocalization("desktop", "apps");

dojo.declare("desktop.ui.applets.Netmonitor", desktop.ui.Applet, {
	//	summary:
	//		A network monitor applet that blinks when an xhr is made
	dispName: "Network Monitor",
	appletIcon: "icon-32-status-network-transmit-receive",
	postCreate: function() {
		var l = dojo.i18n.getLocalization("desktop", "system");
		var apploc = dojo.i18n.getLocalization("desktop", "apps");
		dojo.addClass(this.containerNode, "icon-22-status-network-idle");
		this._xhrStart = dojo.connect(dojo,"_ioSetArgs",this,function(m)
		{
			this.removeClasses();
			var f = Math.random();
			if(f <= (1/3)) dojo.addClass(this.containerNode, "icon-22-status-network-receive");
			else if(f <= (2/3)) dojo.addClass(this.containerNode, "icon-22-status-network-transmit");
			else dojo.addClass(this.containerNode, "icon-22-status-network-transmit-receive");
		}); 
		this._xhrEnd = dojo.connect(dojo.Deferred.prototype,"_fire",this,function(m)
		{
			this.removeClasses();
			dojo.addClass(this.containerNode, "icon-22-status-network-idle");
		}); 
		this.tooltip = new dijit.Tooltip({
			position: ["above", "below", "after", "before"]
		});
		this._onXhr = dojo.connect(api, "xhr", this, function(args) {
			if(args.backend && args.backend == "core.app.fetch.full" && args.notify !== false) {
				var appName = false;
				dojo.forEach(desktop.app.appList, function(app) {
					if(app.id == args.content.id)
						appName = "\""+(apploc[app.name] || app.name)+"\"";
				});
				this.tooltip.label = "<div style='float: left;' class='icon-loading-indicator'></div> " + l.launchingApp.replace("%s", appName || args.content.id);
				this.tooltip.open(this.containerNode);
				var onEnd = dojo.connect(dojo.Deferred.prototype,"_fire",this,function(m) {
					dojo.disconnect(onEnd);
					this.tooltip.close();
				});
			}
		})
		this.inherited("postCreate", arguments);
	},
	removeClasses: function() {
		dojo.removeClass(this.containerNode, "icon-22-status-network-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-idle");
	},
	uninitialize: function() {
		dojo.disconnect(this._xhrStart);
		dojo.disconnect(this._xhrEnd);
		dojo.disconnect(this._onXhr);
		this.inherited("uninitialize", arguments);
	}
});