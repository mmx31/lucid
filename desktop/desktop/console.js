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
			desktop.reload = true;
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
			api.console("&nbsp;&nbsp;ps- show running processes");
			api.console("&nbsp;&nbsp;kill [instance]- kills an instance/pid");
			api.console("&nbsp;&nbsp;clear- clear the screen");
			api.console("&nbsp;&nbsp;logout- logs you out of the desktop");
		},
		ps: function(params)
		{
			api.console("  PID  TTY  CMD");
			object = api.instances.getInstances();
			api.console("0     pts/0   system");
				for(i=0;i<object.length;i++) {
					if(typeof(object[i]) != "undefined") {
						if(object[i].status != "killed") {
						api.console(object[i].instance+"    pts/0   "+object[i].name+" (AppID: "+object[i].appid+")");
						}
					}
				}
		},
		kill: function(params)
		{
			if(params == "") { api.console("kill: usage: kill [instance]"); }
			else if(params == "0") { api.console("kill: system cannot be killed"); }
			else {
			if(api.instances.kill(params) == 1) { api.console("kill: process killed"); }
			else { api.console("kill: process kill failed"); }
			}
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
			api.fs.ls({path: params, callback: function(array)
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
			}});
		},
		mkdir: function(params)
		{
			if(params == "") {
				api.console("mkdir: need a dir name!");
			}
			else {
			api.fs.mkdir({path: params});
			api.console("mkdir: directory created");
			}
		},
		rm: function(params)
		{
			if(params == "") {
				api.console("rm: need a file!");
			}
			else {
			api.fs.rm({path: params});
			api.console("rm: file removed");
			}
		},
		rmdir: function(params)
		{
			if(params == "") {
				api.console("rmdir: need a directory!");
			}
			else {
			api.fs.rmdir({path: params});
			api.console("rmdir: directory removed");
			}
		},
		cat: function(params)
		{
			if(params == "") {
				api.console("cat: need a file!");
			}
			else {
			api.fs.read({path: desktop.console.path + params, callback: function(array)
			{
				api.console(array[0].contents);
			}
			});
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
			var command = dojo.byId('consoleinput').value.split(" ")[0]
			if((typeof this.aliases[command]) == "undefined")
			{
				api.console(eval(dojo.byId('consoleinput').value));
			}
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
