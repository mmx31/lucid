dojo.provide("desktop.app");
dojo.require("desktop.apps._App");

desktop.app = {
	//	summary:
	//		Contains all the app functions of the desktop
	//	appList: Array,
	//		Contains a list of each app's information (loaded on startup)
	appList: [],
	//	instances: Array
	//		Contains each instance of all apps
	instances: [],
	//	instanceCount: Int
	//		A counter for making new instances of apps
	instanceCount: 0,
	init: function(){
		//	summary:
		//		Loads the app list from the server
		var xtalkInit = dojo.subscribe("crosstalkInit", this, function(){
            dojo.unsubscribe(xtalkInit);
            setTimeout(dojo.hitch(this, "startupApps"), 300);
        });
		desktop.xhr({
			backend: "core.app.fetch.list",
			load: dojo.hitch(this, function(data, ioArgs){
				this.appList = data;
				var style = document.createElement("style");
				style.type="text/css";
				var contents = "";
				dojo.forEach(data, function(item){
					if(!item.icon || item.icon.indexOf(".") === -1) return;
					contents += ".icon-app-"+item.sysname+" {"
								+"width: 16px; height: 16px;"
								+"background-image: url('"+dojo.moduleUrl("desktop.apps."+item.sysname, item.icon)+"');"
								+"}";
				});
				desktop.textContent(style, contents);
				document.getElementsByTagName("head")[0].appendChild(style);
			}),
			handleAs: "json"
		});
	},
	startupApps: function(){
		//	summary:
		//		Launches the apps specified in desktop.config to launch on startup
		var g = desktop.config.startupApps;
        dojo.forEach(desktop.config.startupApps, function(app){
            if(typeof app == "object"){
		app.arguments._startup = true;
                desktop.app.launch(app.name, app.arguments);
	    }
            else
                desktop.app.launch(app, {_startup: true});
        });
	},
	launchHandler: function(/*String?*/file, /*Object?*/args, /*String?*/format){
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
		if(file){
			var l = file.lastIndexOf(".");
			var ext = file.substring(l + 1, file.length);
			if (ext == "desktop"){
				desktop.filesystem.readFileContents(file, dojo.hitch(this, function(content){
					var c = content.split("\n");
					desktop.app.launch(c[0], dojo.fromJson(c[1]));
				}));
				return;
			}
		}
		if(!format){
			desktop.filesystem.info(file, dojo.hitch(this, function(f){
				var type = f.type;
				this._launchHandler(file, type, args);
			}));
		}
		else {
			this._launchHandler(file, format, args);
		}
	},
	_launchHandler: function(/*String*/file, /*String*/type, /*Object?*/args){
		//	summary:
		//		Internal method that is used by the main launchHandler method.
		//		This is what actually launches the app.
		//	file:
		//		the full path to the file
		//	type:
		//		the file's mimetype
		//	args:
		//		arguments to pass to the app
		if (type == "text/directory"){
			for (app in this.appList){
				for (key in this.appList[app].filetypes){
					if (this.appList[app].filetypes[key] == "text/directory"){
						if(file) args.path = file;
						desktop.app.launch(this.appList[app].sysname, args);
						return;
					}
				}
			}
		}
		else {
			var typeParts = type.split("/");
			for (app in this.appList){
				for (key in this.appList[app].filetypes){
					var parts = this.appList[app].filetypes[key].split("/");
					if (parts[0] == typeParts[0] && (parts[1] == typeParts[1])){
						if(file) args.file = file;
						desktop.app.launch(this.appList[app].sysname, args);
						return;
					}
				}
			}
			var typeParts = type.split("/");
			for (app in this.appList){
				for (key in this.appList[app].filetypes){
					var parts = this.appList[app].filetypes[key].split("/");
					if (parts[0] == typeParts[0] && (parts[1] == "*" || parts[1] == typeParts[1])){
						if(file) args.file = file;
						desktop.app.launch(this.appList[app].sysname, args);
						return;
					}
				}
			}
		}
		desktop.dialog.alert({
			title: "Error",
			message: "Cannot open " + file + ", no app associated with " + type
		});
	},
	launch: function(/*String*/name, /*Object?*/args, /*Function?*/onComplete, /*Function?*/onError)
	{
		//	summary:
		//		Fetches an app if it's not in the cache, then launches it. Returns the process ID of the application.
		//	name:
		//		the app's name
		//	args:
		//		the arguments to be passed to the app
		//	onComplete:
		//		a callback once the app has initiated
        //	onError:
        //	    if there was a problem launching the app, this will be called
		dojo.publish("launchApp", [name]);
		desktop.log("launching app "+name);
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
        desktop._loadApp(name);
		var pid = false;
		try {
			pid = desktop.app.instances.length;
			var realName = "";
			var icon = "";
			var compatible = "";
			dojo.forEach(desktop.app.appList, function(item){
				if(item.sysname != name) return;
				realName = item.name;
				icon = item.icon;
				compatible = item.compatible;
			})
			var instance = desktop.app.instances[pid] = new desktop.apps[name]({
				sysname: name,
				name: realName,
				instance: pid,
				compatible: compatible,
				icon: icon,
				args: args
			});
			try {
				instance.init(args||{});
			}
			catch(e){
				console.error(e);
                d.errback(e);
			}
			instance.status = "active";
			d.callback(instance);
		}
		catch(e){
			console.error(e);
            d.errback(e);
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
	list: function(/*Function*/onComplete, /*Function?*/onError){
		//	summary:
		//		Lists the apps available on the server. Returns a dojo.Deferred object.
		//	onComplete:
		//		a callback function. First argument passed is an array with desktop.app._listCallbackItem objects for each app.
        //	onError:
        //	    if there was an error, this will be called
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		desktop.xhr({
			backend: "core.app.fetch.listAll",
			load: dojo.hitch(d, "callback"),
            error: dojo.hitch(d, "errback"),
			handleAs: "json"
		});
        return d; // dojo.Deferred
	},
	//PROCESS MANAGEMENT FUNCTIONS
	getInstances: function(){
		//	summary:
		//		Returns an array of the current valid instances
		returnObject = [];
		for(var x = 0; x<desktop.app.instances.length; x++){
			if (desktop.app.instances[x] != 'null'){
				try { if(typeof desktop.app.instances[x].status == "string")
					returnObject.push(desktop.app.instances[x]);
				} catch(e){ }
			}
		}
		return returnObject;
	},
	getInstancesStatus: function(){
		//	summary:
		//		Returns an array of the current valid instances status
		var returnObject = [];
		for(var x = 0; x<desktop.app.instances.length; x++){
				if (desktop.app.instances[x] != null){
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
	getInstance: function(/*Integer*/instance){
		//	summary:
		//		Returns an instance
		//	instance:
		//		the instance ID to fetch
		return desktop.app.instances[instance];
	},
	kill: function(/*Integer*/instance){
		//	summary:
		//		Kills an instance
		//	instance:
		//		the instance ID to kill
		try {
			desktop.log("procSystem: killing instance "+instance);
			desktop.app.instances[instance].kill();	//Pre-Kill the instance
			return true;
		}
		catch(err){
			desktop.log("procSystem: killing instance "+instance+" failed. setting status to zombie.");
			console.error(err);
			desktop.app.instances[instance].status = "zombie";
			return false;
		}
	},
	
	//IDE functions
	/*=====
	_saveArgs: {
		//	sysname: String?
		//		the unique system name of the app. Cannot contain spaces.
		sysname: "",
		//	name: String?
		//		the name of the app
		name: "my supercool app",
		//	author: String?
		//		the person who wrote the app
		author: "foo barson",
		//	email: String?
		//		the email address of the author
		email: "foo@barson.org",
		//	version: String?
		//		the version of the app
		version: "1.0",
		//	maturity: String?
		//		The development stage of the app. Can be "Alpha", "Beta", or "Stable"
		maturity: "Alpha",
		//	category: String?
		//		The app's category
		//		Can be "Accessories", "Development", "Games", "Graphics", "Internet", "Multimedia", "Office", "Other", or "System"
		category: "Accessories",
		//	filename: String?
		//		the path to the filename to write the code to. Relative to the app's namespace.
		//		provide "<appSysnameHere>.js" to write to the main file
		filename: "",
		//	contents: String?
		//		the new code to write to the file specified
		contents: "({init: function(args){ alert('hi'); }})",
		//	onComplete: Function
		//		a callback function. First argument is the ID of the app just saved (if a sysname was provided)
		onComplete: function(id){},
        //  onError: Function
        //      if there was an error, this will be called.
        onError: function(){}
	},
	=====*/
	save: function(/*desktop.app._saveArgs*/app)
	{
		//	summary:
		//		saves an app to the server. Returns a dojo.Deferred object. 
        var onComplete = app.onComplete;
        var onError = app.onError;
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		if((app.sysname||app.filename)||(app.sysname&&app.filename))
		{
			  desktop.log("IDE API: Saving application...");
	          desktop.xhr({
	               backend: "core.app.write.save",
	               content : app,
		       error: function(data, ioArgs){
						d.errback(data);
						desktop.log("IDE API: Save error");
			},
	               load: function(data, ioArgs){
						d.callback(data.sysname||true);
						desktop.log("IDE API: Save Sucessful");
						delete desktop.app.apps[parseInt(data.id)];
						desktop.xhr({
							backend: "core.app.fetch.list",
							load: dojo.hitch(this, function(data, ioArgs){
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
			desktop.log("IDE API: Error! Could not save. Not all required strings in the object are defined.");
		 	d.errback();
		 }
         return d; // dojo.Deferred
	},
	createFolder: function(/*String*/path, /*Function?*/onComplete, /*Function?*/onError){
		//	summary:
		//		creates a folder for an app. Returns a dojo.Deferred object.
		//	path:
		//		the path to the folder to create, relative to the apps directory
		//	onComplete:
		//		a callback function once the operation is complete
        //	onError:
        //	    if there was an error, this will be called
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		return desktop.xhr({
			backend: "core.app.write.createFolder",
			content: {
				dirname: path
			},
			load: function(data){
				d[data=="0" ? "callback" : "errback"]();
			},
            error: dojo.hitch(d, "errback")
		})
        return d; // dojo.Deferred
	},
	get: function(/*String*/name, /*String?*/file, /*Function*/onComplete, /*Function?*/onError)
	{
		//	summary:
		//		Loads an app's information from the server w/o caching. Returns a dojo.Deferred object.
		//	name:
		//		the system name of the app to fetch
		//	file:
		//		the filename to open. If excluded, the callback will get an array of filenames
		//	callback:
		//		A callback function. Gets passed a desktop.app._saveArgs object, excluding the callback.
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		desktop.xhr({
			backend: "core.app.fetch.full",
			content: {
				sysname: name,
				filename: file
			},
			load: function(data, ioArgs)
			{
				if(data.contents)
					d.callback(/*String*/data.contents);
				else
					d.callback(/*Array*/data);
			},
            error: dojo.hitch(d, "errback"),
			handleAs: "json"
		});
        return d; // dojo.Deferred
	},
	renameFile: function(/*String*/origName, /*String*/newName, /*Function?*/onComplete, /*Function?*/onError){
		//	summary:
		//		renames a file in the app directory
		//	origName:
		//		the original name of the file
		//	newName:
		//		the new name of the file
		//	callback:
		//		a callback function once the action is complete
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		return desktop.xhr({
			backend: "core.app.write.rename",
			content: {
				origName: origName,
				newName: newName
			},
			load: function(data){
				d[data=="0" ? "callback" : "errback"]();
			},
            error: dojo.hitch(d, "errback")
		});
        return d; // dojo.Deferred
	},
	remove: function(/*String?*/name, /*String?*/filePath, /*Function?*/onComplete, /*Function?*/onError){
		//	summary:
		//		removes an app from the system
		//	name:
		//		the app's system name
		//	filePath:
		//		the path to the specific file to remove
		//	onComplete:
		//		a callback function once the app has been removed
        //	onError:
        //	    if there was a problem, this will be called
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		var args = {};
		if(name) args.sysname = name
		if(filePath) args.filePath = filePath;
		desktop.xhr({
			backend: "core.app.write.remove",
			content: args,
			load: function(data){
				d[data=="0" ? "callback" : "errback"]();
			},
            error: dojo.hitch(d, "errback")
		})
        return d; // dojo.Deferred
	}
}

