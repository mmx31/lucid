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
		/**
		 * The seperator used when retreiving an app
		 * 
		 * @type {String}
		 * @alias desktop.app.xml_seperator
		 * @memberOf desktop.app
		 * @deprecated We use json to transfer the apps instead.
		 */
		this.xml_seperator = "[==separator==]";
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
			dojo.xhrPost({
			    url: desktop.core.backend("core.app.fetch.full"),
				content: {
					id: appID
				},
			    load: dojo.hitch(this, function(data, ioArgs)
				{
					this._fetchApp(data, callback, args);
				}),
			    error: function(error, ioArgs) { api.toaster("Error: "+error.message); }
			});
		}
		this._fetchApp = function(data, callback, args)
		{
			var app = dojo.fromJson(data);
			api.log("creating app constructor...");
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
			dojo.xhrGet({
			    url: desktop.core.backend("core.app.fetch.id"),
				content: {
					name: name
				},
			    load: dojo.hitch(this, function(data, ioArgs)
				{
					if(data != "") { this.launch(data, args); }
					else { api.log("translation failed. invalid app name"); }
				}),
			    error: function(error, ioArgs) { api.toaster("Error: "+error.message); }
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

