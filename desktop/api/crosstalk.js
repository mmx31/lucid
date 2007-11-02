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

/* 
 * Group: api
 * 
 * Package: crosstalk
 * 
 * Summary:
 * 		An API that allows an app to communicate with other applications on a system-wide level. 
 */
api.crosstalk = new function()
{
	this.session = new Array();	// handler storage
	this.assignid = 0;		// ids for storage
	/** 
	* register an event handler
	* 
	* @alias api.crosstalk.registerHandler
	* @param {Integer} instance	The current instance ID
	* @param {Function} callback	A callback to pass the data to
	* @memberOf api.crosstalk
	*/
	this.registerHandler = function(params)
    		{
			/*
			*OMG this code is super-fucked.
			* infact, it's more of a mess than code
			*but hey, it works.
			*/
		api.crosstalk.session[api.crosstalk.assignid] = new Object();
		api.crosstalk.session[api.crosstalk.assignid].suspended = false;
		api.crosstalk.session[api.crosstalk.assignid].appid = desktop.app.instances[params.instance].id;
                api.crosstalk.session[api.crosstalk.assignid].callback = params.callback;
                api.crosstalk.session[api.crosstalk.assignid].instance = params.instance;
		id = api.crosstalk.assignid;
		api.crosstalk.assignid = api.crosstalk.assignid + 1;
		return id;
		}
	/** 
	* unregister an event handler
	* 
	* @alias api.crosstalk.unregisterHandler
	* @param {Integer} id	The current registered ID
	* @memberOf api.crosstalk
	*/
		this.unregisterHandler = function(id)
    		{
			api.crosstalk.session[id].suspended = true;
			}
	/** 
	* the crosstalk api checker, called every somewhat or so seconds, internally. then will handle it from the registered crap...
	* 
	* @alias api.crosstalk.internalCheck
	* @memberOf api.crosstalk
	*/
	this._internalCheck = function()
		{
		if (api.crosstalk.session.length == 0) { // no data in array (no handlers registered)
		//api.console("Crosstalk API: No events to process...");
			}
		else { // handlers found. ask to obtain any events.
		//api.console("Crosstalk API: Checking for events...");
        	dojo.xhrGet({
	        	url: "../backend/api.php?crosstalk=checkForEvents",
				handleAs: "xml",
	        	load: dojo.hitch(this, this._internalCheck2),
	        	error: function(type, error) { api.console("Error in Crosstalk call: "+error.message); }
        	});
		}
		}
		
	/** 
	* the crosstalk api checker, called every 20 or so seconds, internally. then will handle it from the registered crap...
	* 
	* @alias api.crosstalk.internalCheck
	* @memberOf api.crosstalk
	*/
	this.sendEvent = function(params)
		{
        	dojo.xhrGet({
        	url: "../backend/api.php",
			content: {
				crosstalk: "sendEvent",
				userid: params.userid,
				message: params.message,
				appid: params.appid,
				instance: params.instance
			},
			handleAs: "xml",
        	error: function(type, error) {
				alert("Error in Crosstalk call: "+error.message);
				this.setup_timer();
			},
        	mimetype: "text/xml"
        	});
		}


	/** 
	* the crosstalk api checker, stage2, compare the results with the handled handlers ;)
	* 
	* @alias api.crosstalk.internalCheck2
	* @memberOf api.crosstalk
	*/
	this._internalCheck2 = function(data, ioArgs)
	{	// JayM: I tried to optimize the thing as much as possible, add more optimization if needed. 
		if(data != "")
		{
			// No events here. (Screwed up code)
			var results = data.getElementsByTagName('event');
			var handled = false;
			for(var i = 0; i<results.length; i++)
			{	
				for(var x = 0; x<api.crosstalk.session.length; x++)
				{
					if(api.crosstalk.session[x].suspended != true)
					{
						if(results[i].getAttribute("appid") == api.crosstalk.session[x].appid)
						{
							if(results[i].getAttribute("instance") == api.crosstalk.session[x].instance || results[i].getAttribute("instance") == 0)
							{
								api.console("Found handler, appid: "+results[i].getAttribute("appid"));
								var id = results[i].getAttribute("id"); //id of the event in database.
								api.crosstalk.session[x].callback({ message: results[i].firstChild.nodeValue, appid: results[i].getAttribute("appid"), instance: results[i].getAttribute("instance"), sender: results[i].getAttribute("sender")});
								//remove the event, now. it has been handled.
						        dojo.xhrGet({
						        	url: "../backend/api.php?crosstalk=removeEvent&id="+id,
									handleAs: "xml",
						        	error: function(type, error) { alert("Error in CrosstalkRemoval call: "+error.message); },
						        	mimetype: "text/xml"
						        });
								handled = true;
							}
						}
					}
				}
				if(handled != true) {
					//Found unhandled code. Do NOT remove, it may be useful later on.
					//api.console("Crosstalk API: Unhandled event, appid: "+results[i].getAttribute("appid")+" instance: "+results[i].getAttribute("instance")+" message: "+results[i].firstChild.nodeValue);
				}
			}
		}
		else
		{
			api.console("No events for user.");
		}
		this.setup_timer();
	}
	/** 
	* handle system messages
	* 
	* @alias api.crosstalk.handleSystemMessage
	* @memberOf api.crosstalk
	*/
	this.handleSystemMessage = function(object) {
	api.ui.alert({title: "Psych Desktop", message: "<center> <b> System Message (senderID: "+object.sender+") </b> <br> "+object.message+" </center>"});
	}
	/** 
	* send system messages
	* 
	* @alias api.crosstalk.sendSystemMessage
	* @memberOf api.crosstalk
	*/
	this.sendSystemMessage = function(ooo) {
	//api.ui.alert("<center> <b> System Message </b> <br> "+message" </center>");
	api.crosstalk.sendEvent({ userid: ooo.userid, appid: 0, instance: 0, message: ooo.message });
	}
	/** 
	* the crosstalk timer starter
	* 
	* @alias api.crosstalk.init
	* @memberOf api.crosstalk
	*/
	this.init = function()
	{
		if(typeof(this.alreadyDone) == "undefined") {
			// Hack into the API
			api.crosstalk.session[api.crosstalk.assignid] = new Object();
			api.crosstalk.session[api.crosstalk.assignid].suspended = false;
			api.crosstalk.session[api.crosstalk.assignid].appid = 0;
	        api.crosstalk.session[api.crosstalk.assignid].callback = api.crosstalk.handleSystemMessage;
	        api.crosstalk.session[api.crosstalk.assignid].instance = 0;
			id = api.crosstalk.assignid;
			api.crosstalk.assignid = api.crosstalk.assignid + 1;
			this.alreadyDone = true;
			api.console("Crosstalk API: Init complete.");
		}
		// start checking for events
		this.setup_timer();
	}
	this.setup_timer = function()
	{
		this.timer = setTimeout(dojo.hitch(this, this._internalCheck), desktop.config.crosstalkPing);
	}
	/** 
	* the crosstalk timer stopper
	* 
	* @alias api.crosstalk.stop
	* @memberOf api.crosstalk
	*/
	this.stop = function()
	{
		// stop checking for events
		clearTimeout(this.timer);
	}

		
}
