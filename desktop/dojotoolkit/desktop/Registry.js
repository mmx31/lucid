dojo.provide("desktop.Registry");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.declare("desktop.Registry", dojo.data.ItemFileWriteStore, {
	//	summary:
	//		An API that allows storage in a table format for users.
	//		This is basically a persistant dojo.data store with write capabilities.
	//		See dojo's documentation on dojo.data for more info.
	__desktop_name: "",
	__desktop_appname: 0,
	constructor: function(/*Object*/args){
		//	args: {name: String}
		//		the name of the store
		//	args: {appname: String}
		//		the current app's name. (this.sysname)
		//	args: {data: Object}
		//		this argument differs from a regular datastore; if the database exists on the server then it is ignored and the server-side data is used.
		this.__desktop_name = args.name;
		this.__desktop_appname = args.appname;
		
		this._jsonData = null;
		this.exists(dojo.hitch(this, function(e){
			if(e == true) this.url = this._jsonFileUrl = desktop.xhr("api.registry.stream.load")
			+ "&appname=" + encodeURIComponent(args.appname)
			+ "&name=" + encodeURIComponent(args.name);
			else this.data = this._jsonData = args.data;
		}), true);
	},
	_saveEverything: function(saveCompleteCallback, saveFailedCallback, newFileContentString){
		desktop.xhr({
			backend: ("api.registry.stream.save"),
			content: {
				value: newFileContentString,
				appname: this.__desktop_appname,
				name: this.__desktop_name
			},
			load: function(data, ioArgs){
				saveCompleteCallback();
			},
			error: function(type, error){
				saveFailedCallback();
			}
		});
	},
	exists: function(/*Function*/callback, /*Boolean*/sync)
	{
		//	summary:
		//		Checks if this store exists on the server
		//	callback:
		//		a callback function. The first argument passed to it is true if it does exist, false if it does not.
		//	sync:
		//		should the call be syncronous? defaults to false
		desktop.xhr({
			backend: "api.registry.info.exists",
			sync: sync,
			content: {
				name: this.__desktop_name,
				appname: this.__desktop_appname
			},
			load: function(data, ioArgs){
				callback(data.exists);
			},
			handleAs: "json"
		});
	},
	drop: function(/*Function?*/callback)
	{
		//	summary:
		//		Deletes the store on the server.
		//	callback:
		//		a callback function. The first argument passed to it is true if deletion was successful, false if it failed.
		desktop.xhr({
			backend: "api.registry.stream.delete",
			content: {
				name: this.__desktop_name,
				appname: this.__desktop_appname
			},
			load: function(data, ioArgs){
				if(callback)
				{
					callback(data == "0");
				}
			}	
		});
	}
});
