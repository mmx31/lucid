desktop.admin = new function()
{
	this.users = {
		list: function(callback) {
			dojo.xhrGet({
				url: desktop.core.backend("core.administration.users.list"),
				load: function(data, ioArgs) {
					callback(dojo.fromJson(data));
				}
			});
		}
	}
}