dojo.provide("desktop.apps._App");

dojo.declare("desktop.apps._App", null, {
	name: "",
	sysname: "",
	version: "",
	instance: -1,
	status: "",
	constructor: function(info) {
		this.status = "init";
		this.name = info.name;
		this.sysname = info.sysname;
		dojo.connect(this, "kill", this, function() {
            this.status = "killed";
			var pid = this.instance;
			//allow the garbage collector to free up memory
			setTimeout(function(){
				desktop.app.instances[pid]=null;
			}, desktop.config.window.animSpeed + 1000);
        });
		this.instance = info.instance;
		try {
			this.init(info.args||{});
		}
		catch(e) {
			console.error(e);
		}
		this.status = "active";
		if(typeof info.callback == "function") info.callback(this);
	},
	init: function(args) {
		//	summary:
		//		start the app
		
		//since this is a base class for an app, we'll just kill ourselves
		//to prevent it from showing up on the task manager if it is
		//accidentally launched
		this.kill();
	},
	kill: function() {
		//	summary:
		//		cleanup ui, disconnect events, etc.
	}
})
