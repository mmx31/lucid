dojo.provide("desktop.ui.applets.Netmonitor");
dojo.require("dijit.Tooltip");
dojo.requireLocalization("desktop", "system");
dojo.requireLocalization("desktop", "apps");

dojo.declare("desktop.ui.applets.Netmonitor", desktop.ui.Applet, {
	//	summary:
	//		A network monitor applet that blinks when an xhr is made
	dispName: "Network Monitor",
	appletIcon: "icon-32-status-network-transmit-receive",
	postCreate: function(){
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
		this._onLaunch = dojo.subscribe("launchApp", this, function(name){
			if(typeof dojo._loadedModules["desktop.apps."+name] != "undefined") return;
			var appName = false;
			dojo.forEach(desktop.app.appList, function(app){
				if(app.sysname == name)
					appName = "\""+(apploc[app.name] || app.name)+"\"";
			});
			this.tooltip.label = "<div style='float: left;' class='icon-loading-indicator'></div> " + l.launchingApp.replace("%s", appName || name);
			this.tooltip.open(this.containerNode);
			var onEnd = dojo.subscribe("launchAppEnd",this,function(){
				dojo.unsubscribe(onEnd);
				this.tooltip.close();
			});
		})
		this.inherited("postCreate", arguments);
	},
	removeClasses: function(){
		dojo.removeClass(this.containerNode, "icon-22-status-network-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-idle");
	},
	uninitialize: function(){
		dojo.disconnect(this._xhrStart);
		dojo.disconnect(this._xhrEnd);
		dojo.unsubscribe(this._onLaunch);
		this.inherited("uninitialize", arguments);
	}
});