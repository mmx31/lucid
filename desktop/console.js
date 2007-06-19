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
/****************************\
|        Psych Desktop       |
|       Console  Engine      |
|   (c) 2006 Psych Designs   |
\****************************/

desktop.console = new function()
{
this.path = "/";
	this.toggle = function(e)
	{
		if (document.all)
	    {
	    	var evnt = window.event;
	        x = evnt.keyCode;
	    }
	    else
	    {
	    	x = e.keyCode;
	    }
		if(x == "192")
		{
			dojo.byId("consolepath").innerHTML = desktop.console.path;
			if(dojo.byId("console").style.display == "block")
			{
				dojo.byId("console").style.display = "none";
			}
			else
			{
				dojo.byId("console").style.display = "block";
				setTimeout("dojo.byId('consoleinput').focus();", 400);
			}
		}
	}
	this.history = new Array();
	this.history[0] = " ";
	this.hist = 1;
	this.aliases = {
		clear: function(params)
		{
			dojo.byId('consoleoutput').innerHTML = '';
		},
		logout: function(params)
		{
			desktop.core.logout();
		},
		echo: function(params)
		{
			api.console(params);
		},
		reload: function(params)
		{
			window.onbeforeunload = null;
			window.location = window.location;
		},
		help: function(params)
		{
			api.console("--Psych Desktop Console--");
			api.console("You can type any javascript you want to evaluate this console.");
			api.console("Or, you can use these commands:");
			api.console("&nbsp;&nbsp;reload- reload the desktop without logging out");
			api.console("&nbsp;&nbsp;ls [dir]- list files in [dir]");
			api.console("&nbsp;&nbsp;cat [file]- read the file [file]");
			api.console("&nbsp;&nbsp;mkdir [dir]- creates the directory [dir]");
			api.console("&nbsp;&nbsp;rm [file]- removes the file [file]");
			api.console("&nbsp;&nbsp;rmdir [dir]- removes the dir [dir]");
			api.console("&nbsp;&nbsp;clear- clear the screen");
			api.console("&nbsp;&nbsp;logout- logs you out of the desktop");
		},
		ls: function(params)
		{
			if(params == "") params = desktop.console.path;
			api.fs.ls(params, function(array)
			{
				var i = 0;
				while(i < array.length) {
					if(array[i].isDir == true) {
						api.console("[DIR] "+array[i].file);
					}
					else {
						api.console(array[i].file);
					}
				i++;
				}
			i = 0;
			});
		},
		mkdir: function(params)
		{
			if(params == "") {
				api.console("need a dir name!");
			}
			else {
			api.fs.mkdir(desktop.console.path+params);
			api.console("directory created");
			}
		},
		rm: function(params)
		{
			if(params == "") {
				api.console("need a file!");
			}
			else {
			api.fs.rm(desktop.console.path+params);
			api.console("file removed");
			}
		},
		rmdir: function(params)
		{
			if(params == "") {
				api.console("need a directory!");
			}
			else {
			api.fs.rmdir(desktop.console.path+params);
			api.console("directory removed");
			}
		},
		cat: function(params)
		{
			if(params == "") {
				api.console("need a file!");
			}
			else {
			api.fs.read(desktop.console.path + params, function(array)
			{
				api.console(array[0].contents);
			}
			);
		}
	} }
	this.getPath = function()
	{
	dojo.byId('consolepath').value = this.path;
	}
	this.key = function(e)
	{
		if(e.keyCode == "38") //up arrow
		{
			if(this.history[this.hist-1] != undefined && this.hist != 1)
			{
				this.hist--;
				if(this.hist != this.history.length) dojo.byId('consoleinput').value = this.history[this.hist];
				else this.hist++;
			}
		}
		if(e.keyCode == "40") //down arrow
		{
			if(this.hist != this.history.length)
			{
				if(this.hist+1 >= this.history.length)
				{
					this.hist = this.history.length;
					if(this.history[0] == " ") dojo.byId('consoleinput').value = "";
					else dojo.byId('consoleinput').value = this.history[0];
				}
				else
				{
					this.consoleHist++;
					if(this.history[this.consoleHist] == " ") dojo.byId('consoleinput').value = "";
					else dojo.byId('consoleinput').value = this.history[this.hist];
				}
			}
		}
	}
	this.submit = function()
	{
		if(dojo.byId('consoleinput').value == undefined) dojo.byId('consoleinput').value = " ";
		this.history[this.history.length] = dojo.byId('consoleinput').value;
		this.hist = this.history.length;
		try{
			dojo.byId('consoleoutput').innerHTML += '<b>'+desktop.console.path+'$ </b>'+dojo.byId('consoleinput').value+'<br />';
			if(this.aliases[dojo.byId('consoleinput').value.split(" ")[0]] == undefined) eval(dojo.byId('consoleinput').value);
			else
			{
				start = dojo.byId('consoleinput').value.indexOf(" ");
				if(start != -1)
				{
					start++;
					params = dojo.byId('consoleinput').value.substring(start);
				}
				else params = "";
				this.aliases[dojo.byId('consoleinput').value.split(" ")[0]](params);
			}
			dojo.byId('consoleinput').value = '';
			dojo.byId('consoleinput').focus();
			dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
		}
		catch(e){
			if(!e) e='An unknown error has occurred';
			dojo.byId('consoleoutput').innerHTML += e+'<br />\n';
			dojo.byId('consoleinput').value = '';
			this.hist = this.history.length;
			dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
		}
	}
}
