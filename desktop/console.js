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
* Contains all the console functions of the desktop
* 
* @classDescription	Contains all the console functions of the desktop
* @memberOf desktop
*/
desktop.console = new function()
{
	/**
	 * The current working directory
	 * 
	 * @type {String}
	 * @alias desktop.console.path
	 * @memberOf desktop.console
	 */
	this.path = "/";
	/** 
	* Toggles the console
	* 
	* @alias desktop.console.toggle
	* @param {Object} e	parameter that the document.onKey event provides.
	* @memberOf desktop.console
	*/
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
		//alert(x);
		//alert(window.navigator.appName);
		if(window.navigator.appName == "Opera")
		{
			code="96";
		}
		else code="192";
		if(x == code)
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
	/**
	 * Conains the history of console commands.
	 * 
	 * @type {Array}
	 */
	this.history = new Array();
	this.history[0] = " ";
	/**
	 * Used when the user is going through their console history. It is the current history slot that the user has reached
	 * 
	 * @type {Integer}
	 * @alias desktop.console.aliases
	 * @memberOf desktop.console
	 */
	this.hist = 1;
	/**
	 * Contains console aliases that can be used from the console.
	 * 
	 * @alias desktop.console.aliases
	 * @type {Object}
	 * @memberOf desktop.console
	 */
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
			api.console(eval('('+params+')'));
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
		cd: function(params)
		{
			desktop.console.path=params;
			dojo.byId("consolepath").innerHTML = params;
			//TODO: check to see if the directory exists
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
	/** 
	* Gets the current working directory
	* 
	* @alias desktop.console.getPath
	* @type {Function}
	* @memberOf desktop.console
	* @return {String}	Returns the current working directory
	*/
	this.getPath = function()
	{
		dojo.byId('consolepath').value = this.path;
		return this.path;
	}
	/** 
	* Activated on a keystroke. Used for console history.
	* 
	* @alias desktop.console.key
	* @type {Function}
	* @memberOf desktop.console
	* @param {Object} e	The object passed by the onKey* event
	*/
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
					this.hist++;
					if(this.history[this.consoleHist] == " ") dojo.byId('consoleinput').value = "";
					else dojo.byId('consoleinput').value = this.history[this.hist];
				}
			}
		}
	}
	/** 
	* Activated when the console form is submitted. Executes the console command.
	* 
	* @alias desktop.console.submit
	* @type {Function}
	* @memberOf desktop.console
	*/
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
	/** 
	* Draws the console
	* 
	* @alias desktop.console.draw
	* @type {Function}
	* @memberOf desktop.console
	*/
	this.draw = function()
	{
		html  = "<div id='consoleoutput' onClick = \"dojo.byId('consoleinput').focus();\"></div>";
		html += "<form onSubmit='desktop.console.submit(); return false;' onkeydown='desktop.console.key(event);'>";
		html += "<b><span id='consolepath'>~</span>$&nbsp;</b><input type='text' id='consoleinput' />";
		html += "</form>";
		div = document.createElement("div");
		div.id = "console";
		div.setAttribute("onclick", "dojo.byId('consoleinput').focus();");
		div.innerHTML = html;
		document.body.appendChild(div);
	}
}
