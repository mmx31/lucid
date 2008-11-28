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
		this.inherited("uninitialize", arguments);
	}
});
