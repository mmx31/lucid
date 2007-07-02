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
	/** 
	* Checks for events
	* 
	* @alias api.crosstalk.checkForEvents
	* @param {Integer} appID	The current app's ID
	* @param {Function} callback	A callback to pass the data to
	* @memberOf api.crosstalk
	*/
    this.checkForEvents = function(appID, callback)
    {
		var url = "../backend/api.php?crosstalk=checkForEvents&appID="+appID;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.crosstalk.eventProcess(type, data, http, callback); },
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
	/** 
	* Sends a message to an app
	* 
	* @alias api.crosstalk.checkForEvents
	* @param {Integer} appID	The current app's ID
	* @param {String} message	The message to send
	* @param {Integer} destination	The user to send the message to's id
	* @memberOf api.crosstalk
	*/
    this.sendEvent = function(message, appID, destination)
    {
        dojo.io.bind({
			url: "../backend/api.php?crosstalk=sendEvent&message="+message+"&destination="+destination+"&appID="+appID,
        	error: function(type, error){ api.toaster("Error in AJAX call: "+error.message); },
			mimetype: "text/xml"
        });
    }
	/** 
	* Processes events
	* 
	* @alias api.crosstalk.eventProcess
	* @param {String} data	Data passed from dojo.io.bind
	* @param {Function} callback	A callback to pass the data to
	* @memberOf api.crosstalk
	*/
    this.eventProcess = function(type, data, evt, callback)
    {
		var results = data.getElementsByTagName('event');
		if(api.crosstalk.eventArray) {
		delete api.crosstalk.eventArray;
		api.crosstalk.eventArray = new Array(99,99);
		}
		else {
		api.crosstalk.eventArray = new Array(99,99);
		}
		for(var i = 0; i<results.length; i++){
		api.crosstalk.eventArray["status"] = "OK";
		api.crosstalk.eventArray["count"] = i;
		api.crosstalk.eventArray[i] = new Object();
		api.crosstalk.eventArray[i].message = results[i].firstChild.nodeValue;
		api.crosstalk.eventArray[i].sender = results[i].getAttribute("sender");
		api.crosstalk.eventArray[i].appID = results[i].getAttribute("appID");
		}
        if(callback) { callback(); }
        desktop.core.loadingIndicator(1);
	}
}
