dojo.provide("desktop.app");

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
			if((typeof f) == "number")
			desktop.app.launch(g[f]);
		}
	},
	fetchApp: function(/*Integer*/appID, /*Function*/callback, /*anything?*/args)
	{
		//	summary:
		//		Fetches an app and stores it into the cache
		//	appID:
		//		the app's ID
		//	callback:
		//		a callback function (once the app has been fetched)
		//	args:
		//		an argument to be passed to the callback function
		api.xhr({
		    backend: "core.app.fetch.full",
			content: {
				id: parseInt(appID)
			},
		    load: dojo.hitch(this, function(app, ioArgs)
			{
				this._fetchApp(app, callback);
			}),
			handleAs: "json"
		});
	},
	_fetchApp: function(app, callback) {
		dojo.declare("desktop.app.apps.app"+app.id, null, {
			id: app.id,
			name: app.name,
			version: app.version,
			instance: -1,
			status: "",
			constructor: function(info) {
				this.status = "init";
				this.instance = info.instance;
				this.init(info.args);
				this.status = "active";
				if(info.callback) info.callback(this);
			},
			kill: function() {
				//cleanup ui, disconnect events, etc.
			}
		});
		dojo.extend(desktop.app.apps["app"+app.id], eval("("+app.code+")"));
		if(callback)
		{
			if(typeof args == "undefined") args = {};
			callback(parseInt(app.id), args);
		}
	},
	launchByName: function(/*String*/name, /*Object?*/args)
	{
		//	summary:
		//		Fetches an app by name and stores it into the cache
		//	name:
		//		the name of the app
		//	args:
		//		arguments to pass to the app
		api.log("translating app name "+name+" to id...");
		api.xhr({
		    backend: "core.app.fetch.id",
			content: {
				name: name
			},
		    load: dojo.hitch(this, function(data, ioArgs)
			{
				if(typeof data.appid != "undefined") { this.launch(data.appid, args); }
				else { api.log("translation failed. invalid app name"); }
			}),
			handleAs: "json"
		});
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
		var l = file.lastIndexOf(".");
		var ext = file.substring(l + 1, file.length);
		if (ext == "desktop") {
			api.filesystem.readFileContents(file, dojo.hitch(this, function(file){
				var c = file.contents.split("\n");
				desktop.app.launch(c[0], dojo.fromJson(c[1]));
			}));
			return;
		}
		else {
			if(!format) {
				api.filesystem.info(file, dojo.hitch(this, function(f){
					var type = f.type;
					this._launchHandler(file, type, args);
				}));
			}
			else {
				this._launchHandler(file, format, args);
			}
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
						args.path = file;
						desktop.app.launch(this.appList[app].id, args);
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
						args.file = file;
						desktop.app.launch(this.appList[app].id, args);
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
	launch: function(/*Integer*/id, /*Object?*/args, /*Function*/callback)
	{
		//	summary:
		//		Fetches an app if it's not in the cache, then launches it.
		//	id:
		//		the app's id
		//	args:
		//		the arguments to be passed to the app
		//	callback:
		//		a callback once the app has initiated
		api.log("launching app "+id);
		if(typeof this.apps["app"+id] == "undefined")
		{this.fetchApp(id, dojo.hitch(this, "launch", id, args));}
		else
		{
			try {
				var pid = this.instances.length;
				var instance = this.instances[pid] = new desktop.app.apps["app"+id]({
					instance: pid,
					args: args,
					callback: callback
				});
				dojo.connect(instance, "kill", instance, function() {
                    this.status = "killed";
					var pid = this.instance;
					//allow the garbage collector to free up memory
					setTimeout(function(){
						desktop.app.instances[pid]=null;
					}, desktop.config.window.animSpeed + 50);
                });
			}
			catch(e) {
				if(typeof instance.debug == "function") { //Program has it's own error handling system.
					instance.debug(e);
				}
				else { // Use psych desktop error handler
					if(desktop.app.kill(instance.instance) == false) {
						api.ui.alertDialog({title: "Psych Desktop", message: "Application ID:"+id+" (Instance:"+instance.instance+") encountered an error and needs to close.<br><br>Technical Details: "+e+"<br><br>Extra Details: The program failed to respond to a kill request. <br><br><br>You can help by copying this and posting it to the Psych Desktop forums."});
						instance.status = "error";
					}
					else {
				            api.ui.alertDialog({title: "Psych Desktop", message: "Application ID:"+id+" (Instance:"+instance+") encountered an error and needs to close.<br><br>Technical Details: <textarea>"+dojo.toJson(e)+"</textarea><br>You can help by copying this and posting it to the Psych Desktop forums."});
					}
				}
				console.error(e);
			}
		}
	},
	/*=====
	_listCallbackItem: {
		//	id: Int
		//		the app's id
		id: 0,
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
		this.returnObject = new Array();
		for(var x = 0; x<desktop.app.instances.length; x++){
				if (desktop.app.instances[x] != null) {
					var i = desktop.app.instances[x];
					this.returnObject[x] = {
						instance: x,
						status: i.status,
						appid: i.id,
						name: i.name,
						version: i.version
					};
				}
		}
		return this.returnObject;
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
	execString: function(/*String*/code)
	{
		//	summary:
		//		Executes an app's string that does not exist on the system as if it were a real app
		desktop.app._fetchApp({
			id: 666, //anyone who has 666 apps installed is a madman
			name: "testApp",
			code: code
		});
		desktop.app.launch(-1);
	},
	/*=====
	_saveArgs: {
		//	id: Integer
		//		the id of the app. if excluded, creates a new app
		id: 1,
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
		if(typeof app.id != "undefined" &&
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
	                    id: app.id,
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
						app.callback(data.id);
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
	get: function(/*Integer*/appID, /*Function*/callback)
	{
		//	summary:
		//		Loads an app's information from the server w/o caching
		//	appID:
		//		the id of the app to fetch
		//	callback:
		//		A callback function. Gets passed a desktop.app._saveArgs object, excluding the callback.
		api.xhr({
			backend: "core.app.fetch.full",
			content: {
				id: appID
			},
			notify: false,
			load: function(data, ioArgs)
			{
				if(callback) callback(/*desktop.app._saveAppArgs*/data);
			},
			handleAs: "json"
		});
	},
	remove: function(/*Integer*/id, /*Function*/callback) {
		//	summary:
		//		removes an app from the system
		//	id:
		//		the app's id
		//	callback:
		//		a callback function once the app has been removed
		api.xhr({
			backend: "core.app.write.remove",
			content: {
				id: id
			},
			load: function(d) {
				callback(d=="0");
			}
		})
	}
}

