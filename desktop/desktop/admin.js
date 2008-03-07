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
		}
	}
	/*
	 * Class: desktop.admin.users
	 * 
	 * Some user management functions
	 * 
	 * Note: for modifying user information see <desktop.user>
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
		 * 		> 	level: (string), //the user's level (can be "admin", "developer", or "user")
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
