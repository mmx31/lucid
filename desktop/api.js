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

var windowcounter = 0;

function api() {
	this.ui = function() { }
	this.ui = new this.ui();
	this.ui = function() { }
	this.ui.dialog = function()
	{
// coming soon
	}
    //Database API
    //Note: alot of this can be based on the registry.
    this.database = function() { }
    this.database = new this.database();    
    this.database = function()
    {
        this.parseTable = function(rawfields, cols)
        {
          var count=0;
          rawfields=rawfields.split("|||");
          for(field in rawfields)
          {
            table[count][table[count].length-1] = field;
            //this next part will make it so something like table[0]['description'] will be valid
            if(table[count].length =cols.length)
            {
              count++;
            }
            for(col in cols)
            {
              rowcount=0;
              for(row in table)
              {
                for(field in row)
                {
                  table[rowcount][col] = field
                }
                rowcount++;
              }
            }
          }
          return table;
        }
        this.getTable(appid, name, callback)
        {
            //grab the table, parse it using this.parseTable, and pass the array onto the function.
        }
        this.saveTable(appid, pub, name, columns, table)
        {
            rawtable = "";
            for(field in table)
            {
                field.replace(/|||/," ");
                field.replace(/-|-/," ");
                rawtable += field+"|||";
            }
            rawtable.substring(0, rawtable.length-3);
            rawcols = "";
            for(title in columns)
            {
                title.replace(/|||/," ");
                field.replace(/-|-/," ");
                rawcols += title+"|||";
            }
            rawcols.substring(0, rawcols.length-3);

            //umm not sure if it's rawtable.length-3 or rawtable.length-2... might result in a bug...
            dojo.io.bind({
                url: "../backend/api.php?action=saveDatabase",
                method: "post",
                content: {
                    columns: rawcols,
                    table: rawtable,
                    public: pub,
                    name: name,
                    appid: appid
                },
                mimetype:'text/html'
            });            
        }
    }
    //Window API
    this.window = function() { }
    this.window = new this.window();    
    this.window = function()
    {
    	this.id = "win"+windowcounter;
    	windowcounter++;
    	this.innerHTML = "";
    	this.height = "400px";
    	this.width = "500px";
    	this.title = "";
		this.resizable = true;
    	this.empty = function()
    	{
    		this.window.innerHTML = "";
    		if(document.getElementById(this.id))
    		{
    			document.getElementById(this.window.id).innerHTML = "";
    		}
    	}
    	this.write = function(string)
    	{
    		this.innerHTML += string;
    		if(document.getElementById(this.id))
    		{
    			document.getElementById(this.id).innerHTML += string;
    		}		
    	}
    	this.show = function()
    	{
    		windiv=document.createElement("div");
    		windiv.style.position="absolute";
    		windiv.style.top = "5%";
    		windiv.style.left = "5%";
    		windiv.style.width=this.width;
    		windiv.style.height=this.height;
    		windiv.style.zindex="100";
    		windiv.innerHTML=this.innerHTML;
    		document.getElementById("windowcontainer").appendChild(windiv);
    		this.window = dojo.widget.createWidget("FloatingPane", {
    			hasShadow: true,
    			resizable: this.resizable,
    			displayCloseAction: true,
    			title: this.title,
    			displayMaximizeAction: true,
    			displayMinimizeAction: true,
    			taskBarId: "appbar",
    			toggle: "explode",
    			toggleDuration: 300,
    			constrainToContainer: true.
                id: this.id;
    		}, windiv);		
    	}
    	this.destroy = function()
    	{
    		if(this.window) { this.window.destroy(); }
    		else { api.toaster("Warning in app: No window shown."); }
    	}
        this.addChild = function(node)
        {
            this.window.addChild(node);
        }
    }    
    // Registry API

    this.registry = function() { }
    this.registry = new this.registry();

    this.registry.getValue = function(appid,varname,callback)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.registry.processRegistryGet(type, data, http, callback); },
        error: sys_toastererr, mimetype: "text/plain"
        });
    }
    this.registry.saveValue = function(appid,varname,value)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?registry=save&appid="+appid+"&varname="+varname+"&value="+value;
        dojo.io.bind({
            url: url,
            error: sys_toastererr,
            mimetype: "text/plain"
        });
        ui_loadingIndicator(1);
    }
	this.registry.removeValue = function(appid,varname)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?registry=remove&appid="+appid+"&varname="+varname;
        dojo.io.bind({
            url: url,
            error: sys_toastererr,
            mimetype: "text/plain"
        });
        ui_loadingIndicator(1);
    }
    this.registry.processRegistryGet = function(type, data, evt, callback)
    {
        api.registry.value = data;
        if(callback) { callback(data); }
        ui_loadingIndicator(1);
    }

    //filesystem api
    this.fs = function() { }
    this.fs = new this.fs();

	
    this.fs.saveFile = function(file,directory,contents)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?fs=save&file="+file+"&directory="+directory+"&contents="+contents;
        dojo.io.bind({
		url: url,
        error: sys_toastererr,
		mimetype: "text/xml"
        });
    }
	
    this.fs.getFile = function(file,directory,callback)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?fs=load&file="+file+"&directory="+directory;
        dojo.io.bind({url: url,
        load: function(type, data, http) { api.fs.getFileProcess(type, data, http, callback); },
        error: sys_toastererr, mimetype: "text/xml"
        });
    }
	this.fs.listFiles = function(callback)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?fs=list";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.fs.fileListProcess(type, data, http, callback); },
        error: sys_toastererr,
        mimetype: "text/xml"
        });
    }
	this.fs.getFileResult = new Array();
	this.fs.listFilesResult = new Array(99,99);
    this.fs.getFileProcess = function(type, data, evt, callback)
    {
        var results = data.getElementsByTagName('contents');
		api.fs.getFileResult["contents"] = results[0].firstChild.nodeValue;
		api.fs.getFileResult["file"] = results[0].getAttribute("file");
		api.fs.getFileResult["directory"] = results[0].getAttribute("directory");
        api.fs.getFileResult["owner"] = results[0].getAttribute("owner");
		api.fs.getFileResult["sharing"] = results[0].getAttribute("sharing");
		if(callback) { callback() }
        ui_loadingIndicator(1);
        api.toaster("Security Note: FileSystem was accessed.");
    }
	this.fs.fileListProcess = function(type, data, evt, callback)
    {
		var results = data.getElementsByTagName('file');
		for(var i = 0; i<results.length; i++){
		api.fs.listFilesResult["count"] = i;
		api.fs.listFilesResult[i] = {};
		api.fs.listFilesResult[i]["file"] = results[i].firstChild.nodeValue;
		api.fs.listFilesResult[i]["directory"] = results[i].getAttribute("directory");
		api.fs.listFilesResult[i]["owner"] = results[i].getAttribute("owner");
		api.fs.listFilesResult[i]["sharing"] = results[i].getAttribute("sharing");
		}
        if(callback) { callback() }
        ui_loadingIndicator(1);
        api.toaster("Security Note: FileSystem was accessed.");
    }
   
	this.user = function() { }
    this.user = new this.user();
this.user.getUserName = function(callback) {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?action=getUserName";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processGetUserName(type, data, http, callback); },
        error: sys_toastererr, mimetype: "text/plain"
        });
		}
	this.user.processGetUserName = function(type, data, evt, callback)
    {
        api.user.userName = data;
        if(callback) { callback(data); }
        ui_loadingIndicator(1);
    }
	this.user.getUserID = function(callback) {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?action=getUserID";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processGetUserID(type, data, http, callback); },
        error: sys_toastererr, mimetype: "text/plain"
        });
	}
	this.user.processGetUserID = function(type, data, evt, callback)
    {
        api.user.userID = data;
        if(callback) { callback(data); }
        ui_loadingIndicator(1);
    }
	this.user.getUserLevel = function(callback) {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?action=getUserID";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processGetUserLevel(type, data, http, callback); },
        error: sys_toastererr, mimetype: "text/plain"
        });
	}
	this.user.processGetUserLevel = function(type, data, evt, callback)
    {
        api.user.userLevel = data;
        if(callback) { callback(data); }
        ui_loadingIndicator(1);
    }
	//misc api
	this.misc = function() { }
    this.misc = new this.misc();    
    this.misc.logout = function() {
	logout();
	}
	}
	api = new api();

function sys_toastererr(type, error)
{
    api.toaster("Error in AJAX call: "+error.message);
    ui_loadingIndicator(1);
}

    
	