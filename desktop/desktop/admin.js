desktop.admin = new function()
{
	this.diskspace = function(callback) {
		dojo.xhrGet({
			url: desktop.core.backend("core.administration.general.diskspace"),
			load: callback,
			handleAs: "json"
		});
	}
	this.users = {
		list: function(callback) {
			dojo.xhrGet({
				url: desktop.core.backend("core.administration.users.list"),
				dsktp_callback: callback,
				load: function(data, ioArgs) {
					ioArgs.args.dsktp_callback(dojo.fromJson(data));
				}
			});
		},
		remove: function(id, callback)
		{
			dojo.xhrPost({
				url: desktop.core.backend("core.administration.users.delete"),
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
			dojo.xhrGet({
				url: desktop.core.backend("core.administration.users.online"),
				load: callback,
				handleAs: "json"
			});
		}
	}
}
