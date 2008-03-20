dojo.require("dojo.data.ItemFileWriteStore");

/*
 * Class: api.registry
 * 
 * An API that allows storage in a table format for users.
 * This is basically a persistant dojo.data store with write capabilities.
 * See dojo's documentation on dojo.data for more info.
 * We have only documented the methods and arguments that we have added.
 * 
 * Arguments:
 * 		Asside from the regular arguments you'd feed to a datastore, we've added these:
 * 
 * 		name - the name of the store
 * 		appid - the current app's ID. (this.id)
 * 		data - this argument differs from a regular datastore; if the database exists on the server then it is ignored and the server-side data is used.
 */
dojo.declare("api.registry", dojo.data.ItemFileWriteStore, {
	__desktop_name: "",
	__desktop_appid: 0,
	constructor: function(/*Object*/args) {
		this.__desktop_name = args.name;
		this.__desktop_appid = args.appid;
		
		this._jsonData = null;
		this.exists(dojo.hitch(this, function(e) {
			if(e == true) this.url = this._jsonFileUrl = api.xhr("api.registry.stream.load")
			+ "&appid=" + encodeURIComponent(args.appid)
			+ "&name=" + encodeURIComponent(args.name);
			else this._jsonData = args.data;
		}), true);
	},
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
	/*
	 * Method: exists
	 * 
	 * Checks if this store exists on the server
	 * 
	 * Arguments:
	 * 		callback - a callback function. The first argument passed to it is true if it does exist, false if it does not.
	 * 		sync - should the call be syncronous? defaults to false
	 */
	exists: function(/*Function*/callback, /*Boolean*/sync)
	{
		api.xhr({
			backend: "api.registry.info.exists",
			sync: sync,
			content: {
				name: this.__desktop_name,
				appid: this.__desktop_appid
			},
			load: function(data, ioArgs) {
				callback(data.exists);
			},
			handleAs: "json"
		});
	},
	/*
	 * Method: drop
	 * 
	 * Deletes the store on the server.
	 * 
	 * Arguments:
	 * 		callback - a callback function. The first argument passed to it is true if deletion was successful, false if it failed.
	 */
	drop: function(/*Function*/callback)
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
					callback(data == "0");
				}
			}	
		});
	}
});
api.reg = api.registry;
