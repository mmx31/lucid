dojo.provide("desktop.user");
/*
 * Class: desktop.user
 *
 * functions that can be used to do user-related tasks
 */
desktop.user = new function() {
	this.init = function() {
		this.beforeUnloadEvent = dojo.addOnUnload(function(e)
		{
			desktop.config.save(true);
			//desktop.user.logout();
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
	/*
	 * Method: authentication
	 *
	 * changes/retrieves a user's authentication information
	 *
	 * Arguments:
	 * 	op - an object with some arguments. See notes
	 *
	 * Notes:
	 * 	The op argument can have the following keys.
	 *      > {
	 *      >       action: string //The action (get or set)
	 *      >       permission: string //The permission to get or set
	 *      >       password: string //Only required if setting a permission
	 *      > }
	 */
	this.authentication = function(/*Object*/op) {
		var callback = op.callback || false;
		delete op.callback;
		api.xhr({
			backend: "core.user.authentication."+op.action,
			content: op,
			load: function(data) {
				if(callback) callback(data);
			}
		})		
	}
	/*
	 * Method: set
	 *
	 * changes a user's information
	 *
	 * Arguments:
	 * 	op - an object with some arguments. See notes
	 *
	 * Notes:
	 * 	The op argument can have the following keys.
	 *      > {
	 *      >       id: integer //the user's id. If excluded, the current user will be used
	 *      >       name: string //the user's new name. Stays the same when not provided.
	 *      >       username: string //the user's username. Cannot change if you're not the admin. Stays the same when not provided.
	 *      >       email: string //the user's new email. Stays the same when not provided.
	 *      >       permissions: array //the user's new permissions. Stays the same when not provided.
	 *      >       groups: array //the user's new groups. Stays the same when not provided.
	 *      >		callback: function //a callback function. Not required.
	 *      > }
	 */
	this.set = function(/*Object*/op) {
		var callback = op.callback || false;
		delete op.callback;
		if(typeof op.permissions != "undefined") op.permissions = dojo.toJson(op.permissions);
		if(typeof op.groups != "undefined") op.groups = dojo.toJson(op.groups);
		api.xhr({
			backend: "core.user.info.set",
			content: op,
			load: function(data) {
				if(callback) callback(data);
			}
		})		
	}
	/*
	 * Method: logout
	 *
	 * logs a user out
	 */
	this.logout = function()
	{
		if(desktop.reload) { return false; }
		desktop.config.save(true);
		dojo.publish("desktoplogout", []);
		api.xhr({
			backend: "core.user.auth.logout",
			sync: true,
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
