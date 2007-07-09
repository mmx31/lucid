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
* An API that allows an app to communicate with other applications on a system-wide level.
* 
* @classDescription An API that allows an app to communicate with other applications on a system-wide level.
* @memberOf api
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
	this.registerHandler = function(instance, callback)
    		{
		api.crosstalk.session[api.crosstalk.assignid] = new Object();
		api.crosstalk.session[api.crosstalk.assignid].suspended = false;
		api.crosstalk.session[api.crosstalk.assignid].appid = desktop.app.instances[instance].id;
                api.crosstalk.session[api.crosstalk.assignid].callback = callback;
                api.crosstalk.session[api.crosstalk.assignid].instance = instance;
		id = api.crosstalk.assignid;
		api.crosstalk.assignid = api.crosstalk.assignid + 1;
		return id;
		}
	/** 
	* the crosstalk api checker, called every 20 or so seconds, internally. then will handle it from the registered crap...
	* 
	* @alias api.crosstalk.internalCheck
	* @memberOf api.crosstalk
	*/
	this._internalCheck = function()
		{
		if (api.crosstalk.session.length == 0) {
		api.console("Crosstalk API: No events to process...");
			}
		else {
		api.console("Crosstalk API: Checking for events...");
		var url = "../backend/api.php?crosstalk=checkForEvents";
        	dojo.io.bind({
        	url: url,
        	load: function(type, data, http) { api.crosstalk.internalCheck2(type, data, http); },
        	error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        	mimetype: "text/xml"
        	});
		}
		api.crosstalk.start();
		}

	/** 
	* the crosstalk api checker, stage2, compare the results with the handled handlers ;)
	* 
	* @alias api.crosstalk.internalCheck2
	* @memberOf api.crosstalk
	*/
	this._internalCheck2 = function(type, data, http, callback)
		{	// JayM: I tried to optimize the thing as much as possible, add more optimization if needed. 
		var results = data.getElementsByTagName('event');
		var handled = false;
		for(var i = 0; i<results.length; i++){

		for(var x = 0; x<api.crosstalk.session.length; x++){

		if(results[i].getAttribute("appid") == api.crosstalk.session[x].appid) {
		api.crosstalk.session[x].callback(results[i].firstChild.nodeValue);
		handled = true;
		}

		}
		if(handled != true) {
		api.console("Crosstalk API: Unhandled data, appid: "+results[i].getAttribute("appid")+" instance: "+results[i].getAttribute("instance")+" message: "+results[i].firstChild.nodeValue);
		}

		}

		}
	/** 
	* the crosstalk timer starter
	* 
	* @alias api.crosstalk.start
	* @memberOf api.crosstalk
	*/
	this.start = function()
		{
		api.crosstalk.timer = setTimeout("api.crosstalk.internalCheck();",20000);
		}
	/** 
	* the crosstalk timer stopper
	* 
	* @alias api.crosstalk.stop
	* @memberOf api.crosstalk
	*/
	this.stop = function()
		{
		api.crosstalk.timer = 0;
		}

		
}
		api.crosstalk.start();
