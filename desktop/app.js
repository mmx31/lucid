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
		this.instances = new Array();
		this.callback = new Array();
		this.xml_seperator = "[==separator==]";
		this.fetchApp = function(appID, callback)
		{
			//fetch an app, put it into the cache
			desktop.core.loadingIndicator(0);
			if(callback) {this.callback[appID] = callback;}
			dojo.io.bind({
			    url: "../backend/app.php?id="+id,
			    load: dojo.lang.hitch(this, function(type, data, evt)
				{
					rawcode = app_return.split(this.xml_seperator);
				    app_lib = rawcode[5];
				    app_code = rawcode[4];
				    app_id = rawcode[0];
				    apps[app_id] = new function() {
				        this.id = app_id;
				        this.instance = -1;
				        this.code = app_code;
				        this.lib = app_lib;
				        this.init = function()
				        {
				            try {eval(this.code);}
				            catch(e){api.toaster(e);}
				        }
				        eval(this.lib);
				        this.hitch = function(func)
				        {
				            return dojo.lang.hitch(this, func);
				        }
				    }
					if(this.callback[app_id]) {this.callback[app_id]();}
				}),
			    error: function(type, error) { api.toaster("Error: "+error.message); ui_loadingIndicator(1); },
			    mimetype: "text/plain"
			});
		}
		this.launch = function(id)
		{
			ui_loadingIndicator(0);
			if(id=-1) { api.toaster("Error: could not get app list from server"); }
			else
			{
				if(apps[id] == undefined)
				{this.fetchApp(id, dojo.lang.hitch(this, this.launch))}
				else
				{
					this.instances[this.instances.length] = new apps[id];
					this.instances[this.instances.length-1 ].instance = this.instances.length-1;
					this.instances[this.instances.length-1 ].init();
					desktop.core.loadingIndicator(1);
				}
			}
		}
	}