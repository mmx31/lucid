dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.provide("api.console");
dojo.declare("api.console", [dijit._Widget, dijit._Templated, dijit._Contained], {
	templateString: "<div class=\"console\" dojoAttachEvent=\"onclick:focus\"><div class='consoleoutput' dojoAttachEvent=\"onclick:focus\" dojoAttachPoint=\"stdout\"></div><form dojoAttachEvent=\"onsubmit:execute, onkeydown:key\"><b><span class='consolepath' dojoAttachPoint=\"_path\">~</span>$&nbsp;</b><input type='text' class='consoleinput' dojoAttachPoint=\"_input\" /></form></div>",
	path: "/",
	history: [" "],
	hist: 1,
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
			object = api.instances.getInstances();
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
			if(api.instances.kill(params) == 1) { this.stdout.innerHTML += "kill: process killed<br />"; }
			else { this.stdout.innerHTML += "kill: process kill failed<br />"; }
			}
		},
		cd: function(params)
		{
			params = "/"+params;
			this.path=params;
			this._path.innerHTML = (params == "/" ? "~" : params);
			dojo.style(this._input, "paddingLeft", ((params.length*10)+11)+"px");
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
	} },
	focus: function() {
		this._input.focus();
	},
	getPath: function()
	{
		this._path.innerHTML = this.path+"$";
		return this.path;
	},
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

api.log = function(str) {
	str = dojo.toJson(str);
	dojo.query(".consoleoutput").forEach(function(elem) {
		elem.innerHTML += "<br />"+str;
	});
}
