dojo.require("dojo.data.ItemFileWriteStore");

/*
 * Group: api
 * 
 * Package: Registry
 * 
 * Summary:
 * 		An API that allows storage in a table format for users.
 * 
 */
//desktop.core.backend("api.registry.stream.save")
api.registry = function(name, appID)
{
	return dojo.mixin(new dojo.data.ItemFileWriteStore({
		url: desktop.core.backend("api.registry.stream.load")+"&appid="+encodeURIComponent(appID)+"&name="+encodeURIComponent(name)
	}), {
		__desktop_name: name,
		__desktop_appid: appID,
		_saveEverything: function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
			dojo.xhrPost({
				url: desktop.core.backend("api.registry.stream.save"),
				content: {
					value: newFileContentString,
					appid: this.__desktop_appid,
					name: this.__desktop_name
				},
				load: function(data, ioArgs) {
					saveCompleteCallback();
				},
				error: function(type, error) {
					saveFailedCallback();
				}
			});
		}
	});
}
api.reg = api.registry;