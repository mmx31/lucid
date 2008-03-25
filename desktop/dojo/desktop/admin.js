dojo.provide("desktop.admin");
/*
 * Class: desktop.admin
 * 
 * Contains administration functions
 * 
 * The user must be an administrator to use these, otherwise the
 * server-side code will prevent any action from being taken.
 */
desktop.admin = new function()
{
	/*
	 * Method: diskspace
	 * 
	 * Gets the amount of free space on the server
	 * 
	 * Arguments:
	 * 		callback - a callback function. Passes an object as an argument with two properties: 'free', and 'total'
	 */
	this.diskspace = function(/*Function*/callback) {
		api.xhr({
			backend: "core.administration.general.diskspace",
			load: callback,
			handleAs: "json"
		});
	}
	/*
	 * Class: desktop.admin.permission
	 * 
	 * Permission/group management
	 */
	this.permissions = {
		/*
		 * Method: list
		 * 
		 * List the permissions on the system
		 * 
		 * Arguments:
		 * 		callback - a callback function to pass the results to.
		 * 
		 * 		The callback will get a single array of values as it's first argument.
		 * 		Each slot in the array will be an object with the permission's information:
		 * 		> {
		 * 		> 	name: string, //the permission's name
		 * 		> 	description: string, //what this permission restricts
		 * 		> 	initial: bool //the default value if it's not specified by the user's groups/permissions
		 * 		> }
		 */
		list: function(/*Function*/callback) {
			api.xhr({
				backend: "core.administration.permissions.list",
				load: callback,
				handleAs: "json"
			})
		},
		/*
		 * Method: setDefault
		 * 
		 * Set the default value of a permission
		 * 
		 * Arguments:
		 * 		permission - the id of the permission to modify
		 * 		value - the default value of the permission
		 * 		callback - a callback function once the operation is completed
		 */
		setDefault: function(/*String*/permission, /*Boolean*/value, /*Function?*/callback) {
			api.xhr({
				backend: "core.administration.permissions.setDefault",
				content: {
					id: permission,
					value: value
				},
				load: function(data) {
					callback(data == "0");
				}
			});
		}
	}
	/*
	 * Class: desktop.admin.groups
	 * 
	 * Group management functions
	 */
	this.groups = {
		/*
		 * Method: list
		 * 
		 * Lists groups on the server
		 * 
		 * Arguments:
		 * 		callback - a callback function. First arg is an array with group objects:
		 * 		> {
		 * 		> 	id: integer, //the group's ID
		 * 		> 	name: string, //the group's name
		 * 		> 	description: string, //the group's description
		 * 		> 	permissions: array //the group's permissions
		 * 		> }
		 */
		list: function(/*Function*/callback) {
			api.xhr({
				backend: "core.administration.groups.list",
				load: callback|| function(){},
				handleAs: "json"
			});
		},
		/*
		 * Method: add
		 * 
		 * Creates a new group
		 * 
		 * Arguments:
		 * 		args - an object containing additional arguments:
		 * 		> {
		 * 		> 	name: string, //the name of the new group
		 * 		> 	description: string, //the description for the new group
		 * 		> 	permissions: object //the permissions for the group. example: {"some.permission": true, "other.permission": false}
		 * 		> }
		 */
		add: function(/*Object*/args) {
			var callback = args.callback;
			delete args.callback;
			args.permissions = dojo.toJson(args.permissions || {});
			api.xhr({
				backend: "core.administration.groups.add",
				content: args,
				load: function(data) {
					callback(data.id);
				},
				handleAs: "json"
			})
		},
		/*
		 * Method: remove
		 * 
		 * Remove a group from the system
		 * 
		 * Arguments:
		 * 		id - the id of the group to remove
		 * 		callback - a callback function once the operation is complete
		 */
		remove: function(/*Integer*/id, /*Function?*/callback) {
			api.xhr({
				backend: "core.administration.groups.delete",
				content: {
					id: id
				},
				load: function(data) {
					if(callback) callback(data == "0");
				}
			});
		},
		/*
		 * Method: set
		 * 
		 * Set group information
		 * 
		 * Arguments:
		 * 		args - an object containing additional arguments:
		 * 		> {
		 * 		> 	id: integer, //the id of the group to modify
		 * 		> 	name: string, //the new name of the group (optional)
		 * 		> 	description: string, //the new description of the group (optional)
		 * 		> 	permissions: object //the permissions of the group
		 * 		> }
		 */
		set: function(/*Object*/args) {
			var callback = args.callback;
			delete args.callback;
			if(typeof args.permissions != "undefined") args.permissions = dojo.toJson(args.permissions);
			api.xhr({
				backend: "core.administration.groups.set",
				content: args,
				load: function(data) {
					callback(data == "0");
				}
			})
		},
		/*
		 * Method: getMembers
		 * 
		 * Get the members of a group
		 * 
		 * Arguments:
		 * 		id - the id of the group to get the members of
		 * 		callback - callback function. First argument is an array of the users. See api.user.get for the attributes of each object in the array.
		 */
		getMembers: function(/*Integer*/id, /*Function*/callback) {
			api.xhr({
				backend: "core.administration.groups.getMembers",
				content: {
					id: id
				},
				load: callback,
				handleAs: "json"
			})
		},
		/*
		 * Method: addMember
		 * 
		 * adds a user to a group
		 * 
		 * Arguments:
		 * 		id - the group ID
		 * 		userid - the user's id
		 * 		callback - a callback for once the operation has been completed
		 */
		addMember: function(/*Integer*/id, /*Ineger*/userid, /*Function?*/callback) {
			api.xhr({
				backend: "core.administration.groups.addMember",
				content: {
					groupid: id,
					userid: userid
				},
				load: function(data) {
					if(callback) callback(data == "0");
				}
			})
		},
		/*
		 * Method: removeMember
		 * 
		 * removes a user from a group
		 * 
		 * Arguments:
		 * 		id - the group ID
		 * 		userid - the user's id
		 * 		callback - a callback for once the operation has been completed
		 */
		removeMember: function(/*Integer*/id, /*Integer*/userid, /*Function?*/callback) {
			api.xhr({
				backend: "core.administration.groups.removeMember",
				content: {
					groupid: id,
					userid: userid
				},
				load: function(data) {
					if(callback) callback(data == "0");
				}
			})
		}
	}
	/*
	 * Class: desktop.admin.users
	 * 
	 * Some user management functions
	 * 
	 * Note:
	 * 		for modifying user information see <desktop.user>
	 */
	this.users = {
		/*
		 * Method: list
		 * 
		 * List all users
		 * 
		 * Arguments:
		 * 		callback - a callback function. Gets passed an array of user objects
		 * 
		 * Note:
		 * 		This is what each user object consists of:
		 * 		> {
		 * 		> 	id: (integer), //user's numerical id. This is NOT their username!
		 * 		> 	name: (string), //user's real name
		 * 		> 	username: (string), //user's username
		 * 		> 	logged: (bool), //is the user logged in?
		 * 		> 	email: (string), //the user's email
		 * 		> 	permissions: (array), //array of user's permissions
		 * 		> 	groups: (array), //array of the user's groups
		 * 		>	lastauth: (string) //the time that the user last logged in
		 * 		> }
		 */
		list: function(/*Function*/callback) {
			api.xhr({
				backend: ("core.administration.users.list"),
				load: function(data, ioArgs) {
					callback(dojo.fromJson(data));
				}
			});
		},
		/*
		 * Method: create
		 * 
		 * Creates a user on the system
		 * 
		 * Arguments:
		 * 		info - an object with additional parameters
		 * 		> {
		 * 		> 	name: (string), //user's real name
		 * 		> 	username: (string), //user's username
		 * 		> 	email: (string), //the user's email
		 * 		> 	permissions: (array), //array of user's permissions
		 * 		> 	groups: (array), //array of the user's groups
		 * 		> 	password: (string), //the user's password
		 * 		> 	callback: (function) //a callback function once the new user has been created. first argument will be the ID of the new user, except when the username allready exists. In that case the first argument will be false.
		 * 		> }
		 */
		create: function(/*Object*/info) {
			var callback = info.callback;
			delete info.callback;
			info.permissions = dojo.toJson(info.permissions);
			info.groups = dojo.toJson(info.groups);
			api.xhr({
				backend: "core.administration.users.create",
				content: info,
				load: function(data) {
					callback(data.id);
				},
				handleAs: "json"
			});
		},
		/*
		 * Method: remove
		 * 
		 * Permanently removes (deletes) a user from the system
		 * 
		 * Arguments:
		 * 		id - the id of the user to delete (NOT the username)
		 * 		callback - a callback function once the process is complete. passes a single parameter. If it's false the user's deletion failed. If true, it was successful.
		 */
		remove: function(id, callback)
		{
			api.xhr({
				backend: "core.administration.users.delete",
				content: {
					id: id
				},
				load: function(data, ioArgs)
				{
					callback(data == "0");
				}
			});
		},
		/*
		 * Method: online
		 * 
		 * Gets the number of users currently using the system.
		 * 
		 * Arguments:
		 * 		callback - a callback function. Passes a single object as a parameter:
		 * 					> {
		 * 					> 	total: (int), //Total users registered in the system
		 * 					> 	online: (int) //Total users currently online
		 * 					> }
		 */
		online: function(callback) {
			api.xhr({
				backend: "core.administration.users.online",
				load: callback,
				handleAs: "json"
			});
		}
	}
}
