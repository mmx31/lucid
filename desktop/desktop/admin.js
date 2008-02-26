/*
 * Class: desktop.admin
 * 
 * Contains administration functions
 * 
 * 
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
		 * 		callback - 
		 */
		list: function(/*Function*/callback) {
			api.xhr({
				backend: ("core.administration.users.list"),
				load: function(data, ioArgs) {
					callback(dojo.fromJson(data));
				}
			});
		},
		remove: function(id, callback)
		{
			api.xhr({
				backend: "core.administration.users.delete",
				content: {
					id: id
				},
				dsktp_callback: callback,
				load: function(data, ioArgs)
				{
					ioArgs.args.dsktp_callback(data == "0");
				}
			});
		},
		online: function(callback) {
			api.xhr({
				backend: "core.administration.users.online",
				load: callback,
				handleAs: "json"
			});
		}
	}
}
