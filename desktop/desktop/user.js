/*
 * Class: desktop.user
 *
 * functions that can be used to do user-related tasks
 */
desktop.user = new function() {
	this.init = function() {
		this.beforeUnloadEvent = dojo.addOnUnload(function(e)
		{
			desktop.user.logout(true);
		});
	}
	/*
	 * Method: get
	 *
	 * Gets the information of a certain user
	 *
	 * Arguments:
	 * 	options - an object
	 *
	 * Note:
	 * 	The options argument has two keys; id and callback.
	 * 	callback - a callback function
	 * 	id - the id of the user to get. If this is not provided then the current user's information will be fetched.
	 *
	 * 	The callback function gets passed an object with the following info
	 * 	> {
	 * 	>	id: integer //the user's id
	 * 	>	name: string //the user's name
	 * 	>	username: string //the user's username
	 * 	>	email: string //the user's email
	 * 	>	permissions: array //the user's permissions
	 * 	>	groups: array //the user's groups
	 * 	>	lastAuth: string //a timestamp from when the user last logged in
	 * 	> }
	 */
	this.get = function(/*Object*/options) {
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
	this.set = function(op) {
		var callback = op.callback || false;
		delete op.callback;
		api.xhr({
			backend: "core.user.info.set",
			content: op,
			load: function(data) {
				if(callback) callback(data);
			}
		})		
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
