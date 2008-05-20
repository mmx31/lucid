dojo.provide("desktop.ui.applets.Quota");
dojo.require("dijit.ProgressBar");

dojo.declare("desktop.ui.applets.Quota", desktop.ui.Applet, {
	//	summary:
	//		A bar showing the user's quota
	dispName: "Quota",
	appletIcon: "icon-32-devices-drive-harddisk",
	postCreate: function() {
		var bar = this.pBar = new dijit.ProgressBar({
			indeterminate: true,
			maximum: 0,
			progress: 0,
			style: "width: 100px; height: 16px;"
		});
		this.addChild(bar);
		bar.startup();
		this.timer = setInterval(dojo.hitch(this, "update"), 1000*10);
		this.update();
		this.inherited("postCreate", arguments);
	},
	update: function() {
		api.filesystem.getQuota("file://", dojo.hitch(this, function(v) {
			this.pBar.update({
				maximum: v.total,
				progress: v.used,
				indeterminate: false
			});
		}));
	},
	uninitialize: function() {
		clearInterval(this.timer);
	}
});