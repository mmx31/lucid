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
var apps = new Array();
var app_code;
var app_lib;
var xml_seperator = "[==separator==]";
var app_xmlHttp;
var app_instance;
function app_launch(id)
{
if(id == -1)
{
api.toaster("Error: could not get app list from server");
}
else
{
if(apps[id] == undefined)
{
exec_app(id);
}
else
{
apps[id].init();
}
}
}

function exec_app(id)
{
ui_loadingIndicator(0);
var url = "../backend/app.php?id="+id;
dojo.io.bind({
    url: url,
    load: app_StateChange,
    error: erroralert,
    mimetype: "text/plain"
});
}

function erroralert(type, error) { api.toaster("Error: "+error.message); ui_loadingIndicator(1); }

function app_StateChange(type, data, evt){
    app_return = data;
    rawcode = app_return.split(xml_seperator);
    app_lib = rawcode[5];
    app_code = rawcode[4];
    app_instance++;
    app_id = rawcode[0];
    app = function() {
        this.id = app_id;
        this.instance=app_instance;
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
    apps[app_id] = new app();
    apps[app_id].init();
    ui_loadingIndicator(1);
}