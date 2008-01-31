desktop.admin = new function()
{
	this.diskspace = function(callback) {
		api.xhr({
			backend: "core.administration.general.diskspace",
			load: callback,
			handleAs: "json"
		});
	}
	this.users = {
		list: function(callback) {
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
