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

/*
 * Package: api
 * 
 * Summary:
 * 		Contains all the public APIs
 */
var api = new function() {
	//TODO: document some things in here
	this.libList = new Object();
	this.consoleBuffer = new Array();
	dojo.subscribe("desktopload", null, function() {
		for(i=api.consoleBuffer.length-1;i>=0;i--)
		{
			api.console(api.consoleBuffer[i]);
		}
	});
	this.console = function(text)
	{
		//to settle apps over untill the console is ready
		this.consoleBuffer[this.consoleBuffer.length] = text;
	}
	/** 
	* Includes an API at startup.
	* @param {String} api	The name of the API to load. The API has to be a JS file in the /api/ dir.
	*/
	this.require = function(theapi)
	{
		//document.write("<script type='text/javascript' src='./api/"+api+".js'></script>");
			dojo.io.script.get({
				url: "./api/"+theapi+".js",
				preventCache: false,
				id: "api_"+theapi
			});
			this.libList[theapi] = new Object();
			this.libList[theapi].loaded = false;
			this.libList[theapi].inited = false;
	}
	this.init = function()
	{
		api.require("crosssite");
		api.require("crosstalk");
		api.require("registry");
		api.require("fs");
		api.require("ide");
		api.require("instances");
		api.require("misc");
		api.require("soundmanager");
		api.require("startup");
		api.require("tray");
		api.require("ui");
		api.require("user");
		api.require("window");
		this.checkifloaded();
	}
	this.checkifloaded = function()
	{
		for(mod in this.libList)
		{
			if((typeof this.libList[mod]) == "undefined")
			{
				this.libList[mod] = new Object();
				this.libList[mod].loaded = false;
				this.libList[mod].drawn = false;
				this.libList[mod].inited = false;
				this.libList[mod].status = "loading";
			}
			if((typeof this[mod]) != "undefined")
			{
				this.libList[mod].loaded = true;
				for(checklib in this.libList) {
					if((typeof this[checklib]) == "undefined")
					{
						 this.libList[mod].loaded = false;
						 this.libList[mod].inited = false;
						 this.libList[mod].drawn = false;
						 this.libList[mod].status = "error";
                		        	 setTimeout(dojo.hitch(this, this.checkifloaded), 100);
						 api.console("api."+checklib+" has not loaded!");
		                        	 return;
					}
					else {
						if(this.libList[mod].status != "loaded") {
						if(this.libList[mod].status != "ok") {
							console.log("loaded api."+mod);
							this.libList[mod].status = "loaded";
						} }
					}
				}
			}
			else
			{
				this.libList[mod].loaded = false;
				this.libList[mod].inited = false;
				this.libList[mod].drawn = false;
				setTimeout(dojo.hitch(this, this.checkifloaded), 50);
				return;
			}
			for(lib in this.libList) {
				setTimeout(function(){}, 0); //yield
				if((typeof this[lib].draw) == "function" && this.libList[mod].drawn == false) {
					this[lib].draw();
					api.console("drawing api."+lib);
					this.libList[mod].drawn = true;
				}
			}
			for(lib in this.libList) {
				if((typeof this[mod].init) != "undefined") { 
					if(this.libList[mod].inited == false)
					{
						this[mod].init(); 
						this.libList[mod].inited = true;
						api.console("initiating api."+mod);
					}
				}
				else { 
					this.libList[mod].inited = true;
				}
				this.libList[mod].status = "ok";
			}
			desktop.api = api;
		}
	}
}
