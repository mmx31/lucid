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
* An API for making an IDE
* TODO: plan this out better. After that write documentation for it.
* 
* @classDescription An API for making an IDE
* @memberOf api
*/
api.ide = new function()
{
	this.execute = function(code)
	{
		desktop.app._fetchApp(dojo.toJson({
			id: -666,
			code: code
		}));
		desktop.app.launch(-666);
	}
	this.save = function(app)
	{
		if(typeof app.id != "undefined" &&
	        typeof app.title != "undefined" &&
	        typeof app.author != "undefined" &&
	        typeof app.email != "undefined" &&
	        typeof app.version != "undefined" &&
	        typeof app.maturity != "undefined" &&
	        typeof app.category != "undefined" &&
	        typeof app.code != "undefined")
		{
	          dojo.xhrGet({
	               url: "../backend/ide.php",
	               method: "POST",
	               content : {
	                    appid: app.id,
	                    name: app.title,
	                    author: app.author,
	                    email: app.email,
	                    version: app.version,
	                    maturity: app.maturity,
	                    category: app.category,
	                    code: app.code
	               },
	               load: function(data, ioArgs){
						app.callback(parseInt(data));
				   }
	          });
	     }
		 else
		 {
		 	return false;
		 }
	}
	this.load = function(appID, callback)
	{
		dojo.xhrGet({
			url: "../backend/app.php?id="+appID,
			load: function(data, ioArgs)
			{
				data = dojo.fromJson(data)[0];
				if(callback) callback(data);
			}
		});
	}
	this.getAppList = function(callback) {
	dojo.xhrGet({
		url: "../backend/app.php?action=getPrograms",
		load: function(data, ioArgs)
		{
			var apps = dojo.fromJson(data);
			callback(apps);
		},
		mimetype: "text/plain"
	});
	}
}