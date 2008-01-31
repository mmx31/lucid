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
api.registry = function(args)
{
	var finalargs = {};
	finalargs.url = api.xhr("api.registry.stream.load") + "&appid=" + encodeURIComponent(args.appid) + "&name=" + encodeURIComponent(args.name) + "&data=" + encodeURIComponent(dojo.toJson(args.data));
	if(args.typeMap) finalargs.typeMap = args.typeMap;
	var store = dojo.mixin(new dojo.data.ItemFileWriteStore(finalargs), {
		__desktop_name: args.name,
		__desktop_appid: args.appid,
		_saveEverything: function(saveCompleteCallback, saveFailedCallback, newFileContentString) {
			api.xhr({
				backend: ("api.registry.stream.save"),
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
		},
		exists: function(callback)
		{
			api.xhr({
				backend: "api.registry.info.exists",
				content: {
					name: this.__desktop_name,
					appid: this.__desktop_appid
				},
				load: function(data, ioArgs) {
					if(data == "0") callback(true);
					else callback(false);
				}
			});
		},
		drop: function(callback)
		{
			api.xhr({
				backend: "api.registry.stream.delete",
				content: {
					name: this.__desktop_name,
					appid: this.__desktop_appid
				},
				load: function(data, ioArgs) {
					if(callback)
					{
						if(data == "0") callback(true);
						else callback(false);
					}
				}	
			});
		}
	});
	store.fetch();
	return store;
}
api.reg = api.registry;
