dojo.provide("desktop.app");
dojo.require("desktop.apps._App");

desktop.app = {
	//	summary:
	//		Contains all the app functions of the desktop
	//	apps: Object
	//		Contains a cache of each app
	apps: {},
	//	appList: Array,
	//		Contains a list of each app's information (loaded on startup)
	appList: [],
	//	instances: Array
	//		Contains each instance of all apps
	instances: [],
	//	instanceCount: Int
	//		A counter for making new instances of apps
	instanceCount: 0,
	init: function() {
		//	summary:
		//		Loads the app list from the server
		this.onConfigApply = dojo.subscribe("configApply", this, this.startupApps);
		api.xhr({
			backend: "core.app.fetch.list",
			load: dojo.hitch(this, function(data, ioArgs) {
				this.appList = data;
			}),
			handleAs: "json"
		});
	},
	startupApps: function() {
		//	summary:
		//		Launches the apps specified in desktop.config to launch on startup
		dojo.unsubscribe(this.onConfigApply);
		g = desktop.config.startupapps;
		for(var f in g)
		{
			desktop.app.launch(g[f]);
		}
	},
	launchHandler: function(/*String?*/file, /*Object?*/args, /*String?*/format) {
		//	summary:
		//		Launches an app to open a certain file
		//		You must specify either the file *or* it's format
		//		You must also manually pass the app the file's path through the arguments if you want it to actually open it.
		//	file:
		//		the full path to the file
		//	args:
		//		arguments to pass to the app
		//	format:
		//		the mimetype of the file to save bandwidth checking it on the server
		if(!args) args = {};
		if(file) {
			var l = file.lastIndexOf(".");
			var ext = file.substring(l + 1, file.length);
			if (ext == "desktop") {
				api.filesystem.readFileContents(file, dojo.hitch(this, function(file){
					var c = file.contents.split("\n");
					desktop.app.launch(c[0], dojo.fromJson(c[1]));
				}));
				return;
			}
		}
		if(!format) {
			api.filesystem.info(file, dojo.hitch(this, function(f){
				var type = f.type;
				this._launchHandler(file, type, args);
			}));
		}
		else {
			this._launchHandler(file, format, args);
		}
	},
	_launchHandler: function(/*String*/file, /*String*/type, /*Object?*/args) {
		//	summary:
		//		Internal method that is used by the main launchHandler method.
		//		This is what actually launches the app.
		//	file:
		//		the full path to the file
		//	type:
		//		the file's mimetype
		//	args:
		//		arguments to pass to the app
		if (type == "text/directory") {
			for (app in this.appList) {
				for (key in this.appList[app].filetypes) {
					if (this.appList[app].filetypes[key] == "text/directory") {
						if(file) args.path = file;
						desktop.app.launch(this.appList[app].sysname, args);
						return;
					}
				}
			}
		}
		else {
			var typeParts = type.split("/");
			for (app in this.appList) {
				for (key in this.appList[app].filetypes) {
					var parts = this.appList[app].filetypes[key].split("/");
					if (parts[0] == typeParts[0] && (parts[1] == "*" || parts[1] == typeParts[1])) {
						if(file) args.file = file;
						desktop.app.launch(this.appList[app].sysname, args);
						return;
					}
				}
			}
		}
		api.ui.alertDialog({
			title: "Error",
			message: "Cannot open " + file + ", no app associated with " + type
		});
	},
	launch: function(/*String*/name, /*Object?*/args, /*Function*/callback)
	{
		//	summary:
		//		Fetches an app if it's not in the cache, then launches it.
		//	name:
		//		the app's name
		//	args:
		//		the arguments to be passed to the app
		//	callback:
		//		a callback once the app has initiated
		dojo.publish("launchApp", [name]);
		api.log("launching app "+name);
		dojo["require"]("desktop.apps."+name);
		var pid = false;
		try {
			pid = desktop.app.instances.length;
			var realName = "";
			dojo.forEach(desktop.app.appList, function(item) {
				if(item.sysname == name) realName = item.name;
			})
			var instance = desktop.app.instances[pid] = new desktop.apps[name]({
				sysname: name,
				name: realName,
				instance: pid,
				args: args,
				callback: callback
			});
		}
		catch(e) {
			console.error(e);
		}
		dojo.publish("launchAppEnd", [name]);
		return pid;
	},
	/*=====
	_listCallbackItem: {
		//	sysname: String
		//		the app's system name
		sysname: 0,
		//	name: String
		//		the app's name
		name: "",
		//	author: String
		//		the app's author
		author: "",
		//	email: String
		//		the app's author's email
		email: "",
		//	maturity: String
		//		the app's maturity (Alpha/Beta/Stable)
		maturity: "",
		//	category: String
		//		the app's category. See desktop.config.set for a list of catagories possible
		category: "",
		//	version: String
		//		the version of the app
		version: "",
		//	filetypes: Array
		//		an array of mimetypes the app can open
		filetypes: []
	},
	=====*/
	list: function(/*Function*/callback) {
		//	summary:
		//		Lists the apps available on the server
		//	callback:
		//		a callback function. First argument passed is an array with desktop.app._listCallbackItem objects for each app.
		api.xhr({
			backend: "core.app.fetch.list",
			load: callback,
			handleAs: "json"
		});
	},
	//PROCESS MANAGEMENT FUNCTIONS
	getInstances: function() {
		//	summary:
		//		Returns an array of the current instances
		
		//TODO: this behaves way too differently from getInstance.
		//		it returns different keys, and does not return an array with references to the actual instance.
		var returnObject = [];
		for(var x = 0; x<desktop.app.instances.length; x++){
				if (desktop.app.instances[x] != null) {
					var i = desktop.app.instances[x];
					returnObject.push({
						instance: x,
						status: i.status,
						sysname: i.sysname,
						name: i.name,
						version: i.version
					});
				}
		}
		return returnObject;
	},
	getInstance: function(/*Integer*/instance) {
		//	summary:
		//		Returns an instance
		//	instance:
		//		the instance ID to fetch
		return desktop.app.instances[instance];
	},
	kill: function(/*Integer*/instance) {
		//	summary:
		//		Kills an instance
		//	instance:
		//		the instance ID to kill
		try {
			api.log("procSystem: killing instance "+instance);
			desktop.app.instances[instance].kill();	//Pre-Kill the instance
			return true;
		}
		catch(err) {
			api.log("procSystem: killing instance "+instance+" failed. setting status to zombie.");
			console.error(err);
			desktop.app.instances[instance].status = "zombie";
			return false;
		}
	},
	
	//IDE functions
	/*=====
	_saveArgs: {
		//	sysname: Integer
		//		the unique system name of the app. Cannot contain spaces.
		sysname: "",
		//	name: String
		//		the name of the app
		name: "my supercool app",
		//	author: String
		//		the person who wrote the app
		author: "foo barson",
		//	email: String
		//		the email address of the author
		email: "foo@barson.org",
		//	version: String
		//		the version of the app
		version: "1.0",
		//	maturity: String
		//		The development stage of the app. Can be "Alpha", "Beta", or "Stable"
		maturity: "Alpha",
		//	category: String
		//		The app's category
		//		Can be "Accessories", "Development", "Games", "Graphics", "Internet", "Multimedia", "Office", "Other", or "System"
		category: "Accessories",
		//	code: String
		//		the app's code
		code: "({init: function(args) { alert('hi'); }})",
		//	callback: Function
		//		a callback function. First argument is the ID of the app just saved
		callback: function(id) {}
	},
	=====*/
	save: function(/*desktop.app._saveArgs*/app)
	{
		//	summary:
		//		saves an app to the server
		if(typeof app.sysname != "undefined" &&
	        typeof app.name != "undefined" &&
	        typeof app.author != "undefined" &&
	        typeof app.email != "undefined" &&
	        typeof app.version != "undefined" &&
	        typeof app.maturity != "undefined" &&
	        typeof app.category != "undefined" &&
	        typeof app.code != "undefined")
		{
			  api.log("IDE API: Saving application...");
	          api.xhr({
	               backend: "core.app.write.save",
	               content : {
	                    sysname: app.sysname,
	                    name: app.name,
	                    author: app.author,
	                    email: app.email,
	                    version: app.version,
	                    maturity: app.maturity,
	                    category: app.category,
	                    code: app.code
	               },
		       error: function(data, ioArgs) {
						if(app.error) app.error(data, ioArgs);
						api.log("IDE API: Save error");
			},
	               load: function(data, ioArgs){
						app.callback(data.sysname);
						api.log("IDE API: Save Sucessful");
						delete desktop.app.apps[parseInt(data.id)];
						api.xhr({
							backend: "core.app.fetch.list",
							load: dojo.hitch(this, function(data, ioArgs) {
								this.appList = data;
								dojo.publish("updateMenu", [data]);
							}),
							handleAs: "json"
						});
				   },
				   handleAs: "json"
	          });
	     }
		 else
		 {
			api.log("IDE API: Error! Could not save. Not all strings in the object are defined.");
		 	return false;
		 }
	},
	get: function(/*String*/name, /*String?*/file, /*Function*/callback)
	{
		//	summary:
		//		Loads an app's information from the server w/o caching
		//	name:
		//		the system name of the app to fetch
		//	file:
		//		the filename to open. If excluded, the callback will get an array of filenames
		//	callback:
		//		A callback function. Gets passed a desktop.app._saveArgs object, excluding the callback.
		api.xhr({
			backend: "core.app.fetch.full",
			content: {
				sysname: name,
				filename: file
			},
			load: function(data, ioArgs)
			{
				if(callback) callback(/*desktop.app._saveAppArgs|Array*/data);
			},
			handleAs: "json"
		});
	},
	remove: function(/*String*/name, /*Function*/callback) {
		//	summary:
		//		removes an app from the system
		//	name:
		//		the app's system name
		//	callback:
		//		a callback function once the app has been removed
		api.xhr({
			backend: "core.app.write.remove",
			content: {
				sysname: name
			},
			load: function(d) {
				callback(d=="0");
			}
		})
	}
}

