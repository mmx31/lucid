desktop.user = new function() {
	this.init = function() {
		this.beforeUnloadEvent = dojo.connect(window, "onbeforeunload", null, function(e)
		{
			desktop.user.logout(true);
		});
	}
	this.changeUserPassword = function(obj) {
		dojo.xhrGet({
        url: "../backend/api/misc.php?action=changePassword&old="+obj.old+"&new="+obj.newpass,
        load: function(data, ioArgs) {
			if(obj.callback) { obj.callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
	}
	this.changeUserEmail = function(obj) {
		dojo.xhrPost({
        url: "../backend/api/misc.php?action=changeEmail",
		content: {
			pass: obj.old,
			email: obj.newemail
		},
        load: function(data, ioArgs) {
			if(obj.callback) { obj.callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
	}
	this.logout = function(sync)
	{
		if(desktop.reload) { return false; }
		dojo.disconnect(this.beforeUnloadEvent);
		if(typeof sync == "undefined") sync=false;
		desktop.config.save(sync);
		dojo.publish("desktoplogout", ["yes"]);
		dojo.xhrGet({
			url: desktop.core.backend("core.user.auth.logout"),
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
			},
				mimetype: "text/plain"
		});
	}
}