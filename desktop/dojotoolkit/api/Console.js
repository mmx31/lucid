dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.provide("api.Console");
dojo.requireLocalization("api", "console");
dojo.declare("api.Console", [dijit._Widget, dijit._Templated, dijit._Contained], {
	//	summary:
	//		A console widget that you can embed in an app
	//
	//	example:
	//		create a new console alias:
	//	|	myConsole.aliases.foo = function(params) {
	//	| 		if(params == "bar") this.domNode.innerHTML += "baz!";
	//	| 		else this.domNode.innerHTML += "bar!";
	//	|	}
	templateString: "<div class=\"console\" dojoAttachEvent=\"onkeypress:_onKeyPress\" tabindex=\"-1\"></div>",
	//	path: String
	//		The full path that the console is at (can be set at creation, but cannot be changed after)
	path: "file://",
	//	stdin: String
	//		contains the text inputted to the console
	stdin: "",
	//	stdout: String
	//		contains the text outputted to the console
	stdout: "",
	//	histList: array
	//		The command history
	histList: [" "],
	//	histSlot: Integer
	//		internal variable used for history browsing
	histSlot: 1,
	//	 appAttached: bool
	//		is an app attached to the console?
	appAttached: false,
	//	aliases: Object
	//		A JSON object with command aliases. You can add a method to this and it will be a command
	//		Each command is passed a 'params' string which is anything that comes after the command.
	//		Your command must parse the arguments it's passed.
	aliases: {
		clear: function(params)
		{
			this.stdout = "";
			this.detach();
		},
		logout: function(params)
		{
			desktop.core.logout();
			this.detach();
		},
		echo: function(params)
		{
			this.write(eval('('+params+')')+"\n");
			this.detach();
		},
		reload: function(params)
		{
			desktop.reload = true;
			window.onbeforeunload = null;
			window.location = window.location;
			this.detach();
		},
		help: function(params)
		{
			var n = dojo.i18n.getLocalization("api", "console");
			var text = n.helpHeader;
			dojo.forEach(["reload", "ls", "cat", "mkdir", "rm", "rmdir", "ps", "kill", "clear", "logout"], function(a) {
				var s = a;
				if(a == "ls"
				|| a == "mkdir"
				|| a == "rmdir") s += " ["+n.dir+"]";
				if(a == "cat"
				|| a == "rm") s += " ["+n.file+"]";
				if(a == "kill") s += " ["+n.instance+"]";
				s += ("- "+n[a+"Help"] || "Oh noes, I forgot what this does");
				text += s+"\n";
			}, this);
			this.write(text);
			this.detach();
		},
		ps: function(params)
		{
			var text = "   PID  TTY      CMD\n";
			object = desktop.app.getInstances();
			dojo.forEach(object, dojo.hitch(this, function(proc) {
				if (typeof(proc) != "object") { }
				else {
					if(proc.status != "killed") {
						text += "   "+proc.instance+"    pts/0   "+proc.sysname+"\n";
					}
				}
			}));
			this.write(text);
			this.detach();
		},
		kill: function(params)
		{
			var n = dojo.i18n.getLocalization("api", "console");
			if(params == "") { this.write("kill: "+n.usage+": kill ["+n.instance+"]\n"); }
			else if(params == "0") { this.write("kill: "+n.sysCannotBeKilled+"\n"); }
			else {
			if(desktop.app.kill(params) == 1) { this.write("kill: "+n.procKilled+"\n"); }
			else { this.write("kill: "+n.procKillFail+"\n"); }
			}
			this.detach();
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
			this.detach();
			//TODO: check to see if the directory even exists
		},
		ls: function(params)
		{
			var n = dojo.i18n.getLocalization("api", "console");
			if(params == "") params = this.path;
			api.filesystem.listDirectory(params, dojo.hitch(this, function(array) {
				var i = 0;
				var out = "";
				while(i < array.length) {
					if(array[i].type == "text/directory") {
						out += "["+n.dir+"] "+array[i].name + "\n";
					}
					else {
						out += array[i].name + "\n";
					}
				i++;
				}
				this.write(out);
				this.detach();
			}));
		},
		mkdir: function(params)
		{
			var n = dojo.i18n.getLocalization("api", "console");
			if(params == "") {
				this.write("mkdir: "+n.needDirName+"\n");
			}
			else {
				api.filesystem.createDirectory(params);
			}
			this.detach();
		},
		rm: function(params)
		{
			var n = dojo.i18n.getLocalization("api", "console");
			if(params == "") {
				this.write("rm: "+n.needFileName+"\n");
			}
			else {
				api.filesystem.remove(params);
			}
			this.detach();
		},
		cat: function(params)
		{
			var n = dojo.i18n.getLocalization("api", "console");
			if(params == "") {
				this.write("cat: "+n.needFileName+"\n");
				this.detach();
			}
			else {
				api.filesystem.readFileContents(this.path + params, dojo.hitch(this, function(content) {
					this.write(content+"\n");
					this.detach();
				}));
			}
		}
	},
	postCreate: function() {
		this.drawScreen();
	},
	_onKeyPress: function(e)
	{
		e.preventDefault();
		//	summary:
		//		Event handler
		//		Processes key presses, such as the up and down arrows for browsing history
		if(e.keyCode == dojo.keys.UP_ARROW)
		{
		}
		else if(e.keyCode == dojo.keys.DOWN_ARROW)
		{
		}
		else if(e.keyCode == dojo.keys.ENTER) {
			this.write(":"+this.path+"$ "+this.stdin+"\n");
			this.execute(this.stdin);
		}
		else if(e.keyCode == dojo.keys.BACKSPACE) {
			this.stdin = this.stdin.substring(0, this.stdin.length-1);
			this.drawScreen();
		}
		else {
			this.stdin += e.keyChar;
			this.drawScreen();
		}
	},
	write: function(text) {
		this.stdout += text;
		this.drawScreen();
	},
	drawScreen: function() {
		var text = this.stdout;
		if(!this.appAttached) text += ":"+this.path+"$ "+this.stdin;
		this.domNode.textContent = "";
		dojo.forEach(text.split("\n"), function(val, i) {
			var row = document.createElement("div");
			row.textContent += val;
			this.domNode.appendChild(row);
		}, this)
	},
	execute: function(value) {
		this.appAttached = true;
		this.stdin="";
		var cmd = (value.split(" "))[0];
		var params = value.substring(cmd.length+1, value.length);
		if(typeof this.aliases[cmd] == "function") {
			this.aliases[cmd].apply(this, [params]);
		}
		else {
			if(value != "") try {
				this.write(eval(value)+"\n");
			}
			catch(e) {
				this.write(e.message+"\n");
			}
			this.detach();
		}
	},
	detach: function() {
		this.appAttached = false;
		this.drawScreen();
	}
});
