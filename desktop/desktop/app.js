/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
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
			desktop.core.loadingIndicator(0);
			dojo.xhrGet({
			    url: "../backend/app.php?id="+appID,
			    load: dojo.hitch(this, function(data, ioArgs)
				{
					this._fetchApp(data, callback, args);
				}),
			    error: function(error, ioArgs) { desktop.core.loadingIndicator(1); api.toaster("Error: "+error.message); },
			    mimetype: "text/plain"
			});
		}
		this._fetchApp = function(data, callback, args)
		{
			app = dojo.fromJson(data);
					this.apps[app[0].ID] = new Function("\tthis.id = "+app[0].ID+";\n\tthis.name = \""+app[0].name+"\";\n\tthis.version = \""+app[0].version+"\";\n\tthis.instance = -1;\n"+app[0].code);
					if(callback)
					{
						if(args != undefined)
						{
							callback(app[0].ID, args);
						}
						else
						{
							callback(app[0].ID);
						}
					}
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
			if(this.apps[id] == undefined)
			{this.fetchApp(id, dojo.hitch(this, this.launch), args);  desktop.core.loadingIndicator(1);}
			else
			{
				try {
					this.instanceCount++;
					this.instances[this.instanceCount] = new this.apps[id];
					this.instances[this.instanceCount].instance = this.instances.length-1;
					this.instances[this.instanceCount].status = "unknown";
					this.instances[this.instanceCount].init((args ? args : null));
				}
				catch(e) {
					api.ui.alert({title: "Psych Desktop", message: "Application ID:"+id+" encountered an error.<br><br>Technical Details: "+e});
				}
			}
		}
	}
