desktop.user = new function() {
	this.init = function() {
		this.beforeUnloadEvent = dojo.addOnUnload(function(e)
		{
			desktop.user.logout(true);
		});
	}
	this.get = function(options) {
		if(!options.id) { options.id = "0"; }
		api.xhr({
	        backend: "core.user.info.get",
			content: {
				id: options.id
			},
	        load: function(data, ioArgs) {
				data = dojo.fromJson(data);
	        	if(options.callback) { options.callback(data); }
			}
        });
	}
	this.logout = function(sync)
	{
		if(desktop.reload) { return false; }
		if(typeof sync == "undefined") sync=false;
		desktop.config.save(sync);
		dojo.publish("desktoplogout", ["yes"]);
		api.xhr({
			backend: "core.user.auth.logout",
			sync: sync,
			load: function(data, ioArgs){
				if(data == "0")
				{
					dojo.style(document.body, "display", "none");
					history.back();
					window.close();
				}
				else
				{
					api.log("Error communicating with server, could not log out");
				}
			}
		});
	}
}
