dojo.provide("desktop.ui.applets.Quota");
dojo.require("dijit.ProgressBar");

dojo.declare("desktop.ui.applets.Quota", desktop.ui.Applet, {
	//	summary:
	//		A bar showing the user's quota
	dispName: "Quota",
	appletIcon: "icon-32-devices-drive-harddisk",
	path: "file://",
	postCreate: function(){
		var bar = this.pBar = new dijit.ProgressBar({
			indeterminate: true,
			maximum: 0,
			progress: 0,
			style: "width: 100px; height: 16px;"
		});
		this.addChild(bar);
		bar.startup();
		this.timer = dojo.subscribe("fsSizeChange", this, "update");
		this.update(this.path);
		this.inherited("postCreate", arguments);
	},
	update: function(path){
		if(path.indexOf(this.path) != 0) return;
		desktop.filesystem.getQuota(path, dojo.hitch(this, function(v){
			this.pBar.update({
				maximum: v.total,
				progress: v.used,
				indeterminate: false
			});
		}));
	},
	uninitialize: function(){
		dojo.unsubscribe(this.timer);
	}
});
