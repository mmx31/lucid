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
/**********************************\
|           Psych Desktop          |
|            API Library           |
|      (c) 2006 Psych Designs      |
| All functions here can be called |
| 	  via api.functionname();      |
\**********************************/

/**
* Contains all the public APIs
*
* @classDescription	Contains all the public APIs
* @constructor	
*/
var api = new Object();
/** 
* Includes an API at startup.
* @param {String} api	The name of the API to load. The API has to be a JS file in the /api/ dir.
*/
api.require = function(api)
{
	document.write("<script type='text/javascript' src='./api/"+api+".js'></script>");
}
api.require("crosstalk");
api.require("database");
api.require("fs");
api.require("ide");
api.require("misc");
api.require("registry");
api.require("soundmanager");
api.require("tray");
api.require("ui");
api.require("user");
api.require("window");
	
