dojo.provide("desktop.admin");

desktop.admin = {
    init: function() {
        desktop.xhr({
            backend: "core.user.info.isAdmin",
            load: function(data) {
                desktop.admin.isAdmin = data.isAdmin;
            },
            sync: true,
            handleAs: "json"
        });
    },
    //  isAdmin: Boolean
    //      Is the current user an administrator?
    isAdmin: null,
	//	summary:
	//		Contains administration functions
	//		The user must be an administrator to use these, otherwise the
	//		server-side code will prevent any action from being taken.
	diskspace: function(/*Function*/callback) {
		//	summary:
		//		Gets the amount of free space on the server
		//	callback:
		//		a callback function. Passes an object as an argument with two properties: 'free', and 'total'
		return desktop.xhr({
			backend: "core.administration.general.diskspace",
			load: callback,
			handleAs: "json"
		});
	},
	permissions: {
		//	summary:
		//		Permission/group management
		/*=====
		_listArgs: {
			//	name: String
			//		the name of the permission
			name: "",
			//	description: String
			//		what this permission restricts
			description: "",
			//	initial: Boolean
			//		the default value if it's not specified by the user's groups/permissions
			initial: true
		},
		=====*/
		list: function(/*Function*/callback) {
			//	summary:
			//		List the permissions on the system
			//	callback:
			//		a callback function to pass the results to.
			//		The callback will get a single array of values as it's first argument.
			//		Each slot in the array will be a desktop.admin.permissions._listArgs object with the permission's information
			desktop.xhr({
				backend: "core.administration.permissions.list",
				load: callback,
				handleAs: "json"
			})
		},
		setDefault: function(/*String*/permission, /*Boolean*/value, /*Function?*/callback) {
			//	summary:
			//		Set the default value of a permission
			//	permission:
			//		the id of the permission to modify
			//	value:
			//		the default value of the permission
			//	callback:
			//		a callback function once the operation is completed
			return desktop.xhr({
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
	},
	groups: {
		//	summary:
		//		Group management functions
		/*=====
		_listArgs: {
			//	name: String
			//		the name of the permission
			name: "",
			//	description: String
			//		what this permission restricts
			description: "",
			//	permissions: Object
			//		An object with permission information for the group
			permissions: {}
		},
		=====*/
		list: function(/*Function*/callback) {
			//	summary:
			//		Lists groups on the server
			//	callback:
			//		a callback function. First arg is an array with desktop.admin.groups._listArgs objects
			return desktop.xhr({
				backend: "core.administration.groups.list",
				load: callback|| function(){},
				handleAs: "json"
			});
		},
		add: function(/*desktop.admin.groups._listArgs*/args) {
			//	summary:
			//		Creates a new group
			var callback = args.callback;
			delete args.callback;
			args.permissions = dojo.toJson(args.permissions || {});
			desktop.xhr({
				backend: "core.administration.groups.add",
				content: args,
				load: function(data) {
					callback(data.id);
				},
				handleAs: "json"
			})
		},
		remove: function(/*Integer*/id, /*Function?*/callback) {
			//	summary:
			//		Remove a group from the system
			//	id:
			//		the id of the group to remove
			//	callback:
			//		a callback function once the operation is complete
			desktop.xhr({
				backend: "core.administration.groups.delete",
				content: {
					id: id
				},
				load: function(data) {
					if(callback) callback(data == "0");
				}
			});
		},
		set: function(/*desktop.admin.groups._listArgs*/args) {
			//	summary:
			//		Set group information
			var callback = args.callback;
			delete args.callback;
			if(typeof args.permissions != "undefined") args.permissions = dojo.toJson(args.permissions);
			desktop.xhr({
				backend: "core.administration.groups.set",
				content: args,
				load: function(data) {
					callback(data == "0");
				}
			})
		},
		getMembers: function(/*Integer*/id, /*Function*/callback) {
			//	summary:
			//		Get the members of a group
			//	id:
			//		the id of the group to get the members of
			//	callback:
			//		callback function. First argument is an array of the users. See desktop.user.get for the attributes of each object in the array.
			desktop.xhr({
				backend: "core.administration.groups.getMembers",
				content: {
					id: id
				},
				load: callback,
				handleAs: "json"
			})
		},
		addMember: function(/*Integer*/id, /*Ineger*/userid, /*Function?*/callback) {
			//	summary:
			//		adds a user to a group
			//	id:
			//		the group ID
			//	userid:
			//		the user's id
			//	callback:
			//		a callback for once the operation has been completed
			desktop.xhr({
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
		removeMember: function(/*Integer*/id, /*Integer*/userid, /*Function?*/callback) {
			//	summary:
			//		removes a user from a group
			//	id:
			//		the group ID
			//	userid:
			//		the user's id
			//	callback:
			//		a callback for once the operation has been completed
			desktop.xhr({
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
	},
	users: {
		//	summary:
		//		Some user management functions
		//		for modifying user information see desktop.user
		list: function(/*Function*/callback) {
			//	summary:
			//		list all users on the system
			//	callback:
			//		a callback function. Gets passed an array of desktop.user._setArgs objects
			desktop.xhr({
				backend: ("core.administration.users.list"),
				load: function(data, ioArgs) {
					callback(dojo.fromJson(data));
				}
			});
		},
		create: function(/*desktop.user._setArgs*/info) {
			//	summary:
			//		Creates a user on the system
			//	info:
			//		A desktop.user._setArgs object, however, the callback gets passed the id of the new user as it's first argument.
			//		Also, you cannot specify the user's id. it is generated by the server.
			var callback = info.callback;
			delete info.callback;
			info.permissions = dojo.toJson(info.permissions || []);
			info.groups = dojo.toJson(info.groups || []);
			desktop.xhr({
				backend: "core.administration.users.create",
				content: info,
				load: function(data) {
					callback(data.id);
				},
				handleAs: "json"
			});
		},
		remove: function(/*Integer*/id, /*Function*/callback)
		{
			//	summary:
			//		Permanently removes (deletes) a user from the system
			//	id:
			//		the id of the user to delete (NOT the username)
			//	callback:
			//		a callback function once the process is complete. passes a single parameter.
			//		If it's false the user's deletion failed. If true, it was successful.
			desktop.xhr({
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
		online: function(/*Function*/callback) {
			//	summary:
			//		Gets the number of users currently using the system.
			//	callback:
			//		a callback function. Passes a single object as a parameter, with two keys;
			//		'total', the total number of users on the system, and 'online', the number of users currently online. 
			//		Both are integers.
			desktop.xhr({
				backend: "core.administration.users.online",
				load: callback,
				handleAs: "json"
			});
		}
	},
	quota: {
		//	summary:
		//		methods that can be used to set default quotas for objects on the system (groups, users)
		//	description:
		//		Quotas restrict the ammount of disk usage a user or group can use.
		//		If a quota is set to 0, then the quota would be limitless.
		//		if a specific object has a quota of -1, then it looks up the default quota for a user or group.
		//		you can use these functions to set that default value.
		list: function(/*Function*/callback) {
			//	summary:
			//		list the different quotas that you can set
			desktop.xhr({
				backend: "core.administration.quota.list",
				load: callback,
				handleAs: "json"
			})
		},
		set: function(/*Object*/quotas, /*Function?*/callback) {
			//	summary:
			//		Sets a default quota for a system object
			//	quotas:
			//		an object containing each quota's new value.
			//		quota sizes are in bytes.
			//		|{
			//		|	user: 1024,
			//		|	group: 0
			//		|}
			desktop.xhr({
				backend: "core.administration.quota.set",
				content: {
					quotas: dojo.toJson(quotas)
				},
				load: callback || function() {}
			})
		}
	}
}
