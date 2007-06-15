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
/************************\
|     Psych  Desktop     |
|  App function library  |
| (c) 2006 Psych Designs |
\************************/
desktop.app = new function()
	{
		this.apps = new Array();
		this.args = new Array();
		this.instances = new Array();
		this.instanceCount = 0;
		this.callback = new Array();
		this.xml_seperator = "[==separator==]";
		this.fetchApp = function(appID, callback, args)
		{
			//fetch an app, put it into the cache
			desktop.core.loadingIndicator(0);
			if(callback) {this.callback[appID] = callback;}
			if(args) {this.args[appID] = args;}
			dojo.io.bind({
			    url: "../backend/app.php?id="+appID,
			    load: dojo.lang.hitch(this, this.fetchAppCallback),
			    error: function(type, error) { desktop.core.loadingIndicator(1); api.toaster("Error: "+error.message); },
			    mimetype: "text/plain"
			});
		}
		this.fetchAppCallback = function(type, data, evt)
				{
					rawcode = data.split(this.xml_seperator);
				    app_lib = rawcode[5];
				    app_code = rawcode[4];
				    app_id = rawcode[0];
				    eval("this.apps["+app_id+"] = function()\n{\n\tthis.id = "+app_id+";\n\tthis.instance = -1;\n\tthis.init = function(args)\n\t{ try {"+app_code+"}\n\tcatch(e){api.toaster(e); desktop.core.loadingIndicator(1);}}\n"+app_lib+"\n\tthis.hitch = function(func)\n{return dojo.lang.hitch(this, func);}\n}");
					if(this.callback[app_id])
					{
						if(this.args[app_id] != undefined)
						{
							this.callback[app_id](app_id, this.args[app_id]);
						}
						else
						{
							this.callback[app_id](app_id);
						}
					}
				}
		this.launch = function(id, args)
		{
			desktop.core.loadingIndicator(0);
			if(this.apps[id] == undefined)
			{this.fetchApp(id, dojo.lang.hitch(this, this.launch), args);  desktop.core.loadingIndicator(1);}
			else
			{
				this.instanceCount++;
				this.instances[this.instanceCount] = new this.apps[id];
				this.instances[this.instanceCount].instance = this.instances.length-1;
				this.instances[this.instanceCount].init(args);
				desktop.core.loadingIndicator(1);
			}
		}
	}