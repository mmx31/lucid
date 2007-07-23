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
	this.compile = function(code)
	{
		var compiledCode = "";
		for(count=0;count<=this.functions.length-1;count++)
		{
			if(count != 0)
			{
				compiledCode += "this."+code[count].name+" = function("+this.code[count].args+")\n{\n";
				compiledCode += code[count].code;
				compiledCode += "\n}\n\n";
			}
		}
		return compiledCode;
	}
	this.execute = function(lib, code)
	{
		var bin = this.compile(lib, code);
		var xml_seperator = desktop.app.xml_seperator;
		var emulated_data = "-666"+xml_seperator+" "+xml_seperator+" "+xml_seperator+" "+xml_seperator+bin.code+xml_seperator+bin.library+xml_seperator+" "+xml_seperator+" "+xml_seperator+" "+xml_seperator;
		desktop.app.fetchAppCallback("", emulated_data, "");
		desktop.app.launch(-666);
	}
	this.save = function(app)
	{
		if(app.id != undefined &&
	        app.metadata.title != undefined &&
	        app.metadata.author != undefined &&
	        app.metadata.email != undefined &&
	        app.metadata.version != undefined &&
	        app.metadata.maturity != undefined &&
	        app.metadata.category != undefined &&
	        app.code != undefined &&
			app.lib != undefined)
		{
	          var ide_headers = new Object();
	          this.compile(app.lib, app.code);
	          dojo.xhrGet({
	               url: "../backend/ide.php",
	               method: "POST",
	               content : {
	                    appid: app.id,
	                    name: app.metadata.title,
	                    author: app.metadata.author,
	                    email: app.metadata.email,
	                    version: app.metadata.version,
	                    maturity: app.metadata.maturity,
	                    category: app.metadata.category,
	                    code: app.code
	               },
	               load: function(data, ioArgs){
						app.callback(parseInt(data));
				   },
	               mimetype: "text/plain"
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
				data = dojo.fromJson(data);
				var app = eval("new function() {"+data[0].code+"}");
				var a = new Object();
				for(item in app)
				{
					if((typeof app[item]) == "function")
					{
						a[item] = new Object();
						//TODO: parse contents, pull out args, name, and code
						a[item].code = app[item].toString(); //TODO: get rid of "function() { " ... " }"
					}
					else
					{
						a[item] = app[item];
					}
				}
				if(callback) callback(a);
			},
			mimetype: "text/plain"
		});
	}
	this.getAppList = function(callback) {
	dojo.xhrGet({
		url: "../backend/app.php?action=getPrograms",
		load: function(data, ioArgs)
		{
			data = data.split(desktop.app.xml_seperator);
			for(x=3;x<=data.length-1;x=x+3)
			{
				apps[data[x]] = new Array();
			}
			for(x=0;x<=data.length-1;x=x+4)
			{
				apps[data[x+3]][apps[data[x+3]].length] = new Object();
				apps[data[x+3]][apps[data[x+3]].length-1].id=data[x];
				apps[data[x+3]][apps[data[x+3]].length-1].name=data[x+1];
			}
			callback(apps);
		},
		mimetype: "text/plain"
	});
	}
}