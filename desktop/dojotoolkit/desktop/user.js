dojo.provide("desktop.user");
/*
 * Class: desktop.user
 *
 * functions that can be used to do user-related tasks
 */
desktop.user = {
	init: function() {
		this.beforeUnloadEvent = dojo.addOnUnload(function(e)
		{
			desktop.config.save(true);
			//desktop.user.logout();
		});
	},
	/*=====
	_getArgs: {
		//	id: Integer?
		//		the Id of the user. If not provided, you must provide a name, username, or email.
		id: 1,
		//	name: String?
		//		the name of the user.
		name: "",
		//	username: String?
		//		the username of the user.
		username: "",
		//	email: String?
		//		the email of the user.
		email: "",
		//	callback: Function
		//		A callback function. First argument is a desktop.user._setArgs object, excluding the callback property
		callback: function(info) {}
	},
	=====*/
	get: function(/*desktop.user._getArgs*/options) {
		//	summary:
		//		Gets the information of a certain user
		if(!options.id) { options.id = "0"; }
		api.xhr({
	        backend: "core.user.info.get",
			content: {
				id: options.id,
				name: options.name,
				email: options.email,
				username: options.username
			},
	        load: function(data, ioArgs) {
				data = dojo.fromJson(data);
	        	if(options.callback) { options.callback(data); }
			}
        });
	},
	/*=====
	_setArgs: {
		//	id: Integer
		//		the user's id. If excluded, the current user will be used
		id: 1,
		//	name: String?
		//		the user's new name. Stays the same when not provided.
		name: "Foo Barson", //
		//	username: String?
		//		the user's username. Cannot change if you're not the admin. Stays the same when not provided.
		username: "foobar",
		//	email: String?
		//		the user's new email. Stays the same when not provided.
		email: "foo@bar.com",
		//	permissions: Array?
		//		the user's new permissions. Stays the same when not provided. Must be an admin to set.
		permissions: [],
		//	groups: Array?
		//		the user's new groups. Stays the same when not provided. Must be an admin to set.
		groups: [],
		//	callback: Function?
		//		a callback function. Not required.
		callback: function() {}
	},
	=====*/
	set: function(/*desktop.user._setArgs*/op) {
		//	summary:
		//		changes a user's information
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
	},
	logout: function()
	{
		//	summary:
		//		logs a user out
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
