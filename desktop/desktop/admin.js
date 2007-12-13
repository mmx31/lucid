desktop.admin = new function()
{
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
		delete: function(id, callback)
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
		}
	}
}
