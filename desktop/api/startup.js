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
api.startup = new function()
{
	/**
	* Allows the program to register it's self as a startup application
	* 
	* @param {object} contains the appid to add
	* @memberOf api.startup
	* @alias api.startup.addApp
	*/
	this.addApp(object)
	{
		phail = false;
		for(a=0; a<desktop.config.startupapps.length; a++) {
			if(desktop.config.startupapps == object.appid) {
				phail = true; //omgz it's already found so don't add it and it's phail
			}
		}
		if(!phail) {
			desktop.config.startupapps.push(object.appid);
			return true;
		}
		return false;
	}
	/**
	* Allows the program to unregister it's self as a startup application
	* 
	* @param {object} contains the appid to add
	* @memberOf api.startup
	* @alias api.startup.delApp
	*/
	this.delApp(object)
	{
		phail = true;
		for(a=0; a<desktop.config.startupapps.length; a++) {
			if(desktop.config.startupapps == object.appid) {
				phail = false; //no phail no phail
				desktop.config.startupapps.splice(a,1);
			}
		}
		if(!phail) {
			return true;
		}
		return false;
	}
}
			