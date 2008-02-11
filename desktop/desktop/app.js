/**
* Contains all the app functions of the desktop
* 
* @classDescription	Contains all the app functions of the desktop
* @memberOf desktop
* @constructor	
*/
desktop.app = new function()
	{
		/**
		 * Contains a cache of each app
		 * 
		 * @type {Array}
		 * @alias desktop.app.apps
		 * @memberOf desktop.app
		 */
		this.apps = new Array();
		this.appList = [];
		/**
		 * Contains each instance of all apps
		 * 
		 * @type {Array}
		 * @alias desktop.app.instances
		 * @memberOf desktop.app
		 */
		this.instances = new Array();
		/**
		 * A counter for making new instances of apps
		 * 
		 * @type {Integer}
		 * @alias desktop.app.instanceCount
		 * @memberOf desktop.app
		 */
		this.instanceCount = 0;
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
		this.startupApps = function() {
			dojo.unsubscribe(this.onConfigApply);
			g = desktop.config.startupapps;
			for(f in g)
			{
				if((typeof f) == "number")
				desktop.app.launch(g[f]);
			}
		}
		/** 
		* Fetches an app and stores it into the cache
		* @param {String} appID	The appID to store into the cache
		* @param {Function} callback	A callback to call once the app has been loaded into the cache
		* @param {String} args	used internally when the callback is desktop.app.launch
		* @memberOf desktop.app
		* @alias desktop.app.fetchApp
		*/
		this.fetchApp = function(appID, callback, args)
		{
			//fetch an app, put it into the cache
			api.xhr({
			    backend: "core.app.fetch.full",
				content: {
					id: parseInt(appID)
				},
			    load: dojo.hitch(this, function(data, ioArgs)
				{
					this._fetchApp(data, callback, args);
				}),
				handleAs: "json"
			});
		}
		this._fetchApp = function(app, callback, args)
		{
			this.apps[app.id] = new Function("\tthis.id = "+app.id+";\n\tthis.name = \""+app.name+"\";\n\tthis.version = \""+app.version+"\";\n\tthis.instance = -1;\n"+app.code);
			if(callback)
			{
				if(typeof args == "undefined") args = {};
				callback(parseInt(app.id), args);
			}
		}
		/** 
		* Fetches an app and stores it into the cache
		* @param {Integer} name	The name of the app to launch
		* @param {Object} args	The args to pass to the 'init' function of the app
		* @memberOf desktop.app
		* @alias desktop.app.fetchApp
		*/
		this.launchByName = function(name, args)
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
		this.launchHandler = function(file, args, format) {
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
						var type = f.mimetype;
						this._launchHandler(file, type, args);
					}));
				}
				else {
					this._launchHandler(file, format, args);
				}
			}
		}
		this._launchHandler = function(file, type, args) {
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
		/** 
		* Fetches an app and stores it into the cache
		* @param {Integer} id	The id of the app to launch
		* @param {Object} args	The args to pass to the 'init' function of the app
		* @memberOf desktop.app
		* @alias desktop.app.fetchApp
		*/
		this.launch = function(id, args)
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
					dojo.connect(this.instances[this.instanceCount],
                                                        "kill",
                                                        this.instances[this.instanceCount],
                                                        function() {
                                                                this.status = "killed";
								//allow the garbage collector to free up memory
								setTimeout(function(){
									this.instances[this.instanceCount]=null;
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
						if(api.instances.kill(instance) == false) {
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
	}

