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
	histList: [],
	//	histSlot: Integer
	//		internal variable used for history browsing
	histSlot: -1,
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
			this.write(params+"\n");
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
			dojo.forEach(["reload", "echo", "ls", "cd", "pwd", "cat", "mkdir", "rm", "rmdir", "ps", "kill", "clear", "logout"], function(a) {
				var s = a;
				if(a == "ls"
				|| a == "mkdir"
				|| a == "rmdir"
				|| a == "cd") s += " ["+n.dir+"]";
				if(a == "cat"
				|| a == "rm") s += " ["+n.file+"]";
				if(a == "kill") s += " ["+n.instance+"]";
				if(a == "echo") s += " ["+n.text+"]";
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
			if (params.charAt(0) != "/") {
				if (params != "") {
					params = (this.path.charAt(this.path.length-1) == "/" ? "" : "/") + params;
					this.path = this.fixPath(this.path+params);
				}
				else {
					this.path = this.fixPath("file://");
				}
			}
			else 
				this.path = this.fixPath(params || "/");
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
		},
		pwd: function(params) {
			this.write(this.formatPath(this.path)+"\n");
			this.detach();
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
		if(e.ctrlKey && e.keyChar == "c") {
			if(typeof this.appAttached == "number")
				desktop.app.kill(this.appAttached);
		}
		else if(e.keyCode == dojo.keys.UP_ARROW)
		{
			var length = this.histList.length;
			length = length-(length == 0 ? 0 : 1);
			if(this.histSlot >= length) return;
			this.histSlot++;
			this.stdin = this.histList[length-this.histSlot];
			this.drawScreen();
		}
		else if(e.keyCode == dojo.keys.DOWN_ARROW)
		{
			if(this.histSlot <= -1) return;
			this.histSlot--;
			if(this.histSlot <= -1) {
				this.stdin="";
				this.histSlot = -1;
			}
			else {
				var length = this.histList.length;
				this.stdin = this.histList[(length-(length == 0 ? 0 : 1))-this.histSlot]
			}
			this.drawScreen();
		}
		else if(e.keyCode == dojo.keys.ENTER) {
			this.inputLine(true);
			this.histList.push(this.stdin);
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
	inputLine: function(write) {
		var lines = this.stdin.split("\n");
		var text = ":"+this.formatPath(this.path)+"$ "+lines[lines.length-1]+"\n";
		if(write) this.write(text);
		return text;
	},
	write: function(text) {
		this.stdout += text;
		this.drawScreen();
	},
	drawScreen: function() {
		var text = this.stdout;
		var doScroll = this.domNode.scrollHeight == this.domNode.scrollTop;
		if(this.appAttached === false) text += this.inputLine();
		api.textContent(this.domNode, "");
		dojo.forEach(text.split("\n"), function(val, i) {
			var row = document.createElement("div");
			api.textContent(row, val);
			this.domNode.appendChild(row);
		}, this)
		if(doScroll) {
			this.domNode.scrollTop = this.domNode.scrollHeight;
		}
	},
	fixPath: function(path) {
		if(path.charAt(0) == "~") path = "/"+path.substring(1);
		if(path.charAt(0) == "/") path = "file:/"+path;
		path = path.split("://");
		while(path[1].indexOf("//") != -1)
			path[1] = path[1].replace("//", "/");
		path = path.join("://");
		return path;
	},
	formatPath: function(path) {
		if(path.indexOf("file://" == 0)) {
			path = "/"+path.substring(("file://").length);
		}
		if(path == "/") path = "~";
		return path;
	},
	execute: function(value) {
		this.appAttached = true;
		this.histSlot = -1;
		this.write("\n");
		this.stdin = "";
		if(value == "") return this.detach();
		var cmd = (value.split(" "))[0];
		var params = value.substring(cmd.length+1, value.length);
		if(typeof this.aliases[cmd] == "function") {
			this.aliases[cmd].apply(this, [params]);
		}
		else {
			if(!this.execApp(cmd, params))
				this.execJs(value);
		}
	},
	execApp: function(cmd, params) {
		for(var i in desktop.app.appList) {
			var app = desktop.app.appList[i];
			if(app.sysname.toLowerCase() != cmd.toLowerCase()) continue;
			var args = {};
			//parse params
			dojo.forEach(params.split("--"), function(text) {
				var parsedArg = dojo.trim(text).split("=");
				if(parsedArg[0])
					args[parsedArg[0]] = parsedArg[1] || true;
			});
			var pid = this.appAttached = desktop.app.launch(app.sysname, args);
			dojo.connect(desktop.app.instances[pid], "kill", this, "detach");
			return true;
		}
		return false;
	},
	execJs: function(value) {
		try {
			this.write(eval(value)+"\n");
		}
		catch(e) {
			this.write(e.message+"\n");
		}
		this.detach();
	},
	detach: function() {
		this.appAttached = false;
		this.drawScreen();
	}
});
