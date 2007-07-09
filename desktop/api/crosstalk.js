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
* An API enabling communication of apps on a global level, regardless of user
* 
* @classDescription	An API enabling communication of apps on a global level, regardless of user
* @memberOf api
* @deprecated the crosstalk API has to be redone. Look at the wiki for some more info.
*/
api.crosstalk = new function()
{
	this.session = new Array();
	this.assignid = 0;
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
		api.crosstalk.assignid = api.crosstalk.assignid + 1;
		}
	/** 
	* the crosstalk api checker, called every 20 or so seconds, internally. then will handle it from the registered crap...
	* 
	* @alias api.crosstalk.registerHandler
	* @param {Integer} instance	The current instance ID
	* @param {Function} callback	A callback to pass the data to
	* @memberOf api.crosstalk
	*/
	this.internalCheck = function()
		{
		if (api.crosstalk.session.length == 0) {
		api.console("Crosstalk API: No events to process...");
			}
		else {
		// blahahahahaah
		}
		api.crosstalk.start();
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
