dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.provide("api.console");
/*
 * Class: api.console
 * 
 * A console widget that you can embed in an app
 */
dojo.declare("api.console", [dijit._Widget, dijit._Templated, dijit._Contained], {
	templateString: "<div class=\"console\" dojoAttachEvent=\"onclick:focus\"><div class='consoleoutput' dojoAttachEvent=\"onclick:focus\" dojoAttachPoint=\"stdout\"></div><form dojoAttachEvent=\"onsubmit:execute, onkeydown:key\"><b><span class='consolepath' dojoAttachPoint=\"_path\">~</span>$&nbsp;</b><input type='text' class='consoleinput' dojoAttachPoint=\"_input\" /></form></div>",
	/*
	 * Property: path
	 * 
	 * The full path that the console is at (can be set at creation, but cannot be changed after)
	 */
	path: "/",
	/*
	 * Property: history
	 * 
	 * The command history
	 */
	history: [" "],
	/*
	 * Property: hist
	 * 
	 * internal variable used for history browsing
	 */
	hist: 1,
	/*
	 * Property: aliases
	 * 
	 * A JSON object with command aliases. You can add a method to this and it will be a command
	 * Each command is passed a 'params' string which is anything that comes after the command.
	 * Your command must parse the arguments it's passed.
	 * 
	 * Example:
	 * 		> myConsole.aliases.foo = function(params) {
	 * 		> 	if(params == "bar") this.stdout.innerHTML += "baz!";
	 * 		> 	else this.stdout.innerHTML += "bar!";
	 * 		> }
	 */
	aliases: {
		clear: function(params)
		{
			this.stdout.innerHTML = '';
		},
		logout: function(params)
		{
			desktop.core.logout();
		},
		echo: function(params)
		{
			api.log(eval('('+params+')'));
		},
		reload: function(params)
		{
			desktop.reload = true;
			window.onbeforeunload = null;
			window.location = window.location;
		},
		help: function(params)
		{
			this.stdout.innerHTML += "--Psych Desktop Console--<br />";
			this.stdout.innerHTML += "You can type any javascript you want to evaluate this console.<br />";
			this.stdout.innerHTML += "Or, you can use these commands:<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;reload- reload the desktop without logging out<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;ls [dir]- list files in [dir]<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;cat [file]- read the file [file]<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;mkdir [dir]- creates the directory [dir]<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;rm [file]- removes the file [file]<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;rmdir [dir]- removes the dir [dir]<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;ps- show running processes<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;kill [instance]- kills an instance/pid<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;clear- clear the screen<br />";
			this.stdout.innerHTML += "&nbsp;&nbsp;logout- logs you out of the desktop<br />";
		},
		ps: function(params)
		{
			this.stdout.innerHTML += "&nbsp;&nbsp;&nbsp;PID&nbsp;&nbsp;TTY&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CMD<br />";
			object = desktop.app.getInstances();
			dojo.forEach(object, dojo.hitch(this, function(proc) {
				if(proc.status != "killed") {
					this.stdout.innerHTML += "&nbsp;&nbsp;&nbsp;"+proc.instance+"&nbsp;&nbsp;&nbsp;&nbsp;pts/0&nbsp;&nbsp;&nbsp;"+proc.name+" (AppID: "+proc.appid+")<br />";
				}
			}));
		},
		kill: function(params)
		{
			if(params == "") { this.stdout.innerHTML += "kill: usage: kill [instance]<br />"; }
			else if(params == "0") { this.stdout.innerHTML += "kill: system cannot be killed<br />"; }
			else {
			if(desktop.app.kill(params) == 1) { this.stdout.innerHTML += "kill: process killed<br />"; }
			else { this.stdout.innerHTML += "kill: process kill failed<br />"; }
			}
		},
		cd: function(params)
		{
			if (params[0] != "/") {
				if (params != "") {
					params = (this.path[this.path.length-1] == "/" ? "" : "/") + params;
					this.path += params;
				}
				else {
					this.path = "/";
				}
			}
			else 
				this.path = params;
			this._path.innerHTML = (this.path == "/" ? "~" : this.path);
			dojo.style(this._input, "paddingLeft", ((this.path.length*9)+16)+"px");
			//TODO: check to see if the directory even exists
		},
		ls: function(params)
		{
			if(params == "") params = this.path;
			api.fs.ls({path: params, callback: dojo.hitch(this, function(array)
			{
				var i = 0;
				while(i < array.length) {
					if(array[i].isDir == true) {
						this.stdout.innerHTML +="[DIR] "+array[i].file + "<br />";
					}
					else {
						this.stdout.innerHTML += array[i].file + "<br />";
					}
				i++;
				}
			i = 0;
			})});
		},
		mkdir: function(params)
		{
			if(params == "") {
				this.stdout.innerHTML += "mkdir: need a dir name!<br />";
			}
			else {
				api.fs.mkdir({path: params});
			}
		},
		rm: function(params)
		{
			if(params == "") {
				this.stdout.innerHTML += "rm: need a file!<br />";
			}
			else {
				api.fs.rm({path: params});
			}
		},
		rmdir: function(params)
		{
			if(params == "") {
				this.stdout.innerHTML += "rmdir: need a directory!";
			}
			else {
				api.fs.rmdir({path: params});
			}
		},
		cat: function(params)
		{
			if(params == "") {
				this.stdout.innerHTML +="cat: need a file!<br />";
			}
			else {
				api.fs.read({path: this.path + params, callback: dojo.hitch(this, function(array)
				{
					this.stdout.innerHTML += array[0].contents.replace("\n", "<br />")+"<br />";
				})});
			}
		}
	},
	/*
	 * Method: focus
	 * 
	 * Focuses the widget
	 */
	focus: function() {
		this._input.focus();
	},
	/*
	 * Method: getPath
	 * 
	 * Updates the path displayed, and returns the current path
	 */
	getPath: function()
	{
		this._path.innerHTML = this.path+"$";
		return this.path;
	},
	/*
	 * Method: key
	 * 
	 * Event handler
	 * Processes key presses, such as the up and down arrows for browsing history
	 */
	key: function(e)
	{
		if(e.keyCode == "38") //up arrow
		{
			if(this.history[this.hist-1] != undefined && this.hist != 1)
			{
				this.hist--;
				if(this.hist != this.history.length) this._input.value = this.history[this.hist];
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
					if(this.history[0] == " ") this._input.value = "";
					else this._input.value = this.history[0];
				}
				else
				{
					this.hist++;
					if(this.history[this.consoleHist] == " ") this._input.value = "";
					else this._input.value = this.history[this.hist];
				}
			}
		}
	},
	/*
	 * Method: execute
	 * 
	 * Event handler
	 * Called when the user presses the enter/return key
	 */
	execute: function(e)
	{
		dojo.stopEvent(e);
		if(this._input.value == undefined) this._input.value = " ";
		this.history[this.history.length] = this._input.value;
		this.hist = this.history.length;
		try{
			this.stdout.innerHTML += '<b>'+(this.path == "/" ? "~" : this.path)+'$ </b>'+this._input.value+'<br />';
			var command = this._input.value.split(" ")[0]
			if((typeof this.aliases[command]) == "undefined")
			{
				this.stdout.appendChild(document.createTextNode(dojo.toJson(eval(this._input.value))));
				this.stdout.innerHTML += "<br />";
			}
			else
			{
				start = this._input.value.indexOf(" ");
				if(start != -1)
				{
					start++;
					params = this._input.value.substring(start);
				}
				else params = "";
				dojo.hitch(this, this.aliases[this._input.value.split(" ")[0]])(params);
			}
			this._input.value = '';
			this._input.focus();
			this.domNode.scrollTop = this.domNode.scrollHeight;
		}
		catch(e){
			if(!e) e='An unknown error has occurred';
			this.stdout.innerHTML += e+'<br />\n';
			this._input.value = '';
			this.hist = this.history.length;
			this.domNode.scrollTop = this.domNode.scrollHeight;
		}
		return false;
	}
});

/*
 * Class: api
 * Method: log
 * 
 * logs a string onto any console that is open
 */
api.log = function(str) {
	str = dojo.toJson(str);
	dojo.query(".consoleoutput").forEach(function(elem) {
		elem.innerHTML += "<br />"+str;
	});
}
