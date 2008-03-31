dojo.provide("desktop.app");
/*
 * Class: desktop.app
 * 
 * Contains all the app functions of the desktop
 */
desktop.app = new function()
{
	/*
	 * Property: apps
	 * 
	 * Contains a cache of each app
	 */
	this.apps = [];
	/*
	 * Property: appList
	 * 
	 * Contains a list of each app's information
	 * (loaded on startup)
	 */
	this.appList = [];
	/*
	 * Property: instances
	 * 
	 * Contains each instance of all apps
	 */
	this.instances = new Array();
	/*
	 * Property: instanceCount
	 * 
	 * A counter for making new instances of apps
	 */
	this.instanceCount = 0;
	/*
	 * Method: init
	 * 
	 * Loads the app list from the server
	 */
	this.init = function() {
		this.onConfigApply = dojo.subscribe("configApply", this, this.startupApps);
		api.xhr({
			backend: "core.app.fetch.list",
			load: dojo.hitch(this, function(data, ioArgs) {
				this.appList = data;
			}),
			handleAs: "json"
		});
	}
	/*
	 * Method: startupApps
	 * 
	 * Launches the apps specified in desktop.config to launch on startup
	 */
	this.startupApps = function() {
		dojo.unsubscribe(this.onConfigApply);
		g = desktop.config.startupapps;
		for(f in g)
		{
			if((typeof f) == "number")
			desktop.app.launch(g[f]);
		}
	}
	/*
	 * Method: fetchApp
	 * 
	 * Fetches an app and stores it into the cache
	 * 
	 * Arguments:
	 * 		appID - the app's ID
	 * 		callback - a callback function (once the app has been fetched)
	 * 		args - an argument to be passed to the callback function
	 */
	this.fetchApp = function(/*Integer*/appID, /*Function*/callback, /*anything?*/args)
	{
		api.xhr({
		    backend: "core.app.fetch.full",
			content: {
				id: parseInt(appID)
			},
		    load: dojo.hitch(this, function(app, ioArgs)
			{
				this.apps[app.id] = new Function("\tthis.id = "+app.id+";\n\tthis.name = \""+app.name+"\";\n\tthis.version = \""+app.version+"\";\n\tthis.instance = -1;\n"+app.code);
				if(callback)
				{
					if(typeof args == "undefined") args = {};
					callback(parseInt(app.id), args);
				}
			}),
			handleAs: "json"
		});
	}
	/*
	 * Method: launchByName
	 * 
	 * Fetches an app by name and stores it into the cache
	 * 
	 * Arguments:
	 * 		name - the name of the app
	 * 		args - arguments to pass to the app (optional)
	 */
	this.launchByName = function(/*String*/name, /*Object?*/args)
	{
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
	}
	/*
	 * Method: launchHandler
	 * 
	 * Launches an app to open a certain file
	 * 
	 * Arguments:
	 * 		file - the full path to the file (Optional)
	 * 		args - arguments to pass to the app (Optional)
	 * 		format - the mimetype of the file to save bandwidth checking it on the server (Optional)
	 * 
	 * Note:
	 * 		You must specify either the file *or* it's format
	 * 		You must also manually pass the app the file's path through the arguments if you want it to actually open it.
	 */
	this.launchHandler = function(/*String?*/file, /*Object?*/args, /*String?*/format) {
		if(!args) args = {};
		var l = file.lastIndexOf(".");
		var ext = file.substring(l + 1, file.length);
		if (ext == "desktop") {
			api.fs.read({
				path: file,
				callback: dojo.hitch(this, function(file){
					var c = file.contents.split("\n");
					desktop.app.launch(c[0], dojo.fromJson(c[1]));
				})
			});
			return;
		}
		else {
			if(!format) {
				api.fs.info(file, dojo.hitch(this, function(f){
					var type = f.type;
					this._launchHandler(file, type, args);
				}));
			}
			else {
				this._launchHandler(file, format, args);
			}
		}
	}
	/*
	 * Method: _launchHandler
	 * 
	 * Internal method that is used by the main launchHandler method.
	 * This is what actually launches the app.
	 * 
	 * Arguments:
	 * 		file - the full path to the file
	 * 		type - the file's mimetype
	 * 		args - arguments to pass to the app (Optional)
	 * 		
	 * Note: See launchHandler's note, it works the same way
	 */
	this._launchHandler = function(/*String*/file, /*String*/type, /*Object?*/args) {
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
	}
	/*
	 * Method: launch
	 * 
	 * Fetches an app if it's not in the cache, then launches it
	 * otherwise, it launches the app
	 * 
	 * Arguments:
	 * 		id - the app's id
	 * 		args - the arguments to pass to the app (Optional)
	 */
	this.launch = function(/*Integer*/id, /*Object?*/args)
	{
		api.log("launching app "+id);
		if(typeof this.apps[id] == "undefined")
		{this.fetchApp(id, dojo.hitch(this, this.launch), args);}
		else
		{
			api.log("preparing to launch app...");
			try {
				this.instanceCount++;
				api.log("constructing new instance...");
				this.instances[this.instanceCount] = new this.apps[id];
				this.instances[this.instanceCount].instance = this.instances.length-1;
                                    var instance = this.instances.length-1;
                                    this.instances[this.instanceCount].status = "init";
				dojo.connect(this.instances[this.instanceCount],
						"init",
						this.instances[this.instanceCount],
						function() {
							this.status = "active";
						}
				);
				dojo.connect(
					this.instances[this.instanceCount],
                    "kill",
                    this.instances[this.instanceCount],
                    function() {
                        this.status = "killed";
						//allow the garbage collector to free up memory
						setTimeout(function(){
							desktop.app.instances[desktop.app.instanceCount]=null;
						}, desktop.config.window.animSpeed + 50);
                    }
                );
				api.log("Executing app...");
				this.instances[this.instanceCount].init((args || {}));
			}
			catch(e) {
				if(typeof this.instances[instance].debug == "function") { //Program has it's own error handling system.
					this.instances[instance].debug(e);
				}
				else { // Use psych desktop error handler
					if(desktop.app.kill(instance) == false) {
						api.ui.alertDialog({title: "Psych Desktop", message: "Application ID:"+id+" (Instance:"+instance+") encountered an error and needs to close.<br><br>Technical Details: "+e+"<br><br>Extra Details: The program failed to respond to a kill request. <br><br><br>You can help by copying this and posting it to the Psych Desktop forums."});
						this.instances[instance].status = "error";
					}
					else {
				            api.ui.alertDialog({title: "Psych Desktop", message: "Application ID:"+id+" (Instance:"+instance+") encountered an error and needs to close.<br><br>Technical Details: <textarea>"+dojo.toJson(e)+"</textarea><br>You can help by copying this and posting it to the Psych Desktop forums."});
					}
				}
				console.error(e);
			}
		}
	}
	/*
	 * Method: list
	 * 
	 * Lists the apps available on the server
	 * 
	 * Arguments:
	 * 		callback - a callback function. First argument passed is an array with each app:
	 * 		> {
	 * 		> 	id: integer, //the app's id
	 * 		> 	name: string, //the app's name
	 * 		> 	author: string, //the app's author
	 * 		> 	email: string, //the app's author's email
	 * 		> 	maturity: string, //the app's maturity
	 * 		> 	category: string, //the app's category. See desktop.config.set for a list of catagories you can get
	 * 		> 	version: string, //the version of the app
	 * 		> 	filetypes: array //an array of mimetypes the app can open
	 * 		> }
	 */
	this.list = function(/*Function*/callback) {
		api.xhr({
			backend: "core.app.fetch.list",
			load: callback,
			handleAs: "json"
		});
	}
	//PROCESS MANAGEMENT FUNCTIONS
	/*
	 * Method: getInstances
	 * 
	 * Returns an array of the current instances
	 * 
	 * TODO: 
	 * 		this behaves way too differently from getInstance.
	 * 		it returns different keys, and does not return an array with references to the actual instance.
	 */
	this.getInstances = function() {
		this.returnObject = new Array();
		for(var x = 1; x<desktop.app.instances.length; x++){
				if (desktop.app.instances[x] != null) {
					var i = desktop.app.instances[x];
					this.returnObject[x-1] = {
						instance: x,
						status: i.status,
						appid: i.id,
						name: i.name,
						version: i.version
					};
				}
		}
		return this.returnObject;
	}
	/*
	 * Method: getInstance
	 * 
	 * Returns an instance
	 * 
	 * Arguments:
	 * 		instance - the instance ID to fetch
	 */
	this.getInstance= function(/*Integer*/instance) {
		return desktop.app.instances[instance];
	}
	/*
	 * Method: kill
	 * 
	 * Kills an instance
	 * 
	 * Arguments:
	 * 		instance - the instance ID to kill
	 */
	this.kill = function(/*Integer*/instance) {
		try {
			desktop.app.instances[instance].kill();
			return true;
		}
		catch(err) {
			console.error(err);
			desktop.app.instances[instance].status = "zombie";
			return false;
		}
	}
}

