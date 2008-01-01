this.blah = 0;
this.init = function(args)
{
	api.instances.setActive(this.instance);
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.form.Textarea");
	dojo.require("dijit.form.Button");
    dojo.require("dijit.form.TextBox");
	dojo.require("dijit.Toolbar");
	this.win = new api.window({
		title: "Katana IDE",
		onHide: dojo.hitch(this, this.kill)
	});
	this.win.setBodyWidget("LayoutContainer", {});
	
	var client = new dijit.layout.ContentPane({style: "overflow-y: auto; overflow-x: hidden;", layoutAlign: "client"}, document.createElement("div"));
		this.editor = document.createElement("textarea");
		this.editor.style.width="100%";	
		this.editor.style.height="100%";
		this.editor.style.border="0px none";
		this.editor.style.margin="0px";
		dojo.connect(this.editor, "onkeypress", this, this.onKey);
		client.setContent(this.editor);
	this.win.addChild(client);
	
	this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
		this.toolbar.addChild(new dijit.form.Button({label: "New", iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, this.newApp)}));
		this.toolbar.addChild(new dijit.form.Button({label: "Open", iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, this.load)}));
		this.toolbar.addChild(new dijit.form.Button({label: "Save", iconClass: "icon-16-actions-document-save", onClick: dojo.hitch(this, this.save)}));
		this.toolbar.addChild(new dijit.form.Button({label: "Metadata", iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.editMetadata)}));
	    this.toolbar.addChild(new dijit.form.Button({label: "About", onClick: dojo.hitch(this, this.about), iconClass: "icon-16-apps-help-browser"}));

	this.win.addChild(this.toolbar);
	this.win.show();
	this.win.startup();
	this.newApp();
}

this.kill = function()
{
	if(typeof this.loadwin != "undefined") {
		if(!this.loadwin.hidden) this.loadwin.hide();
	}
	if(!this.win.hidden)this.win.hide();
	api.instances.setKilled(this.instance);
}

this.newApp = function()
{
	this.app = {
		id: -1,
		code: "",
		name: "NewApp",
		email: "AppCreator@iRule.com",
		version: "1.0",
		category: "accessories",
		maturity: "alpha",
		author: "NewApp Creator"
	};
	this.editor.value="";
}
this.about = function() {
	api.ui.alertDialog({title: "Katana IDE", message:"Psych Desktop Katana IDE - Application Creation IDE<br>Version "+this.version});
}
this.app = {};
this.save = function()
{
	this.editor.disabled = true;
	this.app.code=this.editor.value;
	this.app.callback = dojo.hitch(this, this.saved);
	api.ide.save(this.app);
}

this.saved = function(id)
{
	api.ide.load(parseInt(id), dojo.hitch(this, function(data) {
		var scroll = this.editor.scrollTop;
		var startPos = this.editor.selectionStart;
		var endPos = this.editor.selectionEnd;
		this.editor.value=data.code;
		this.app = data;
		this.editor.disabled = false;
		this.editor.selectionStart = startPos+1;
		this.editor.selectionEnd = endPos+1;
		this.editor.scrollTop = scroll;
		//api.ui.alertDialog({title:"Katana IDE", message:"Save Sucessful"});
		desktop.menu.getApplications();
		delete this.app.callback;
	}));
}
this.spawnID = 0;
this.editMetadata = function()
{
	this.tempCache  = this.editor.value;
        this.editor.value = "To continue working, close the metadata window.";
        this.editor.disabled = true;
        this.winn = new api.window({
			title: "Edit Metadata",
			bodyWidget: "ContentPane",
			onHide: dojo.hitch(this, this._editMetadata)
		});
		var content = "";
        content += "Application ID(appid): <span id=\"appid"+this.instance+this.blah+"\">"+this.app.id+"</span><br>";
        content += "Application Name: <span id=\"appname"+this.instance+this.blah+"\"></span><br>";
        content += "Application Author: <span id=\"appauthor"+this.instance+this.blah+"\"></span><br>";
        content += "Application E-mail: <span id =\"appemail"+this.instance+this.blah+"\"></span><br>";
        content += "Application Version: <span id=\"appversion"+this.instance+this.blah+"\"></span><br>";
        content += "Application Maturity: <span id=\"appmaturity"+this.instance+this.blah+"\"></span><br>";
        content += "Application Category: <span id=\"appcategory"+this.instance+this.blah+"\"></span><br>";
	content += "<p>Closing this window will apply the metadata change.</p>";
	this.winn.body.setContent(content);
	this.winn.show();
	new dijit.form.TextBox({id: "appname"+this.instance+this.blah, name: "appname"+this.instance+this.blah}, document.getElementById("appname"+this.instance+this.blah));
	new dijit.form.TextBox({id: "appauthor"+this.instance+this.blah, name: "appauthor"+this.instance+this.blah}, document.getElementById("appauthor"+this.instance+this.blah));
	new dijit.form.TextBox({id: "appemail"+this.instance+this.blah, name: "appemail"+this.instance+this.blah}, document.getElementById("appemail"+this.instance+this.blah));
	new dijit.form.TextBox({value: this.app.version, id: "appversion"+this.instance+this.blah, name: "appversion"+this.instance+this.blah}, document.getElementById("appversion"+this.instance+this.blah));
	new dijit.form.TextBox({id: "appmaturity"+this.instance+this.blah, name: "appmaturity"+this.instance+this.blah}, document.getElementById("appmaturity"+this.instance+this.blah));
	new dijit.form.TextBox({id: "appcategory"+this.instance+this.blah, name: "appcategory"+this.instance+this.blah}, document.getElementById("appcategory"+this.instance+this.blah));
	dijit.byId("appname"+this.instance+this.blah).setValue(this.app.name);
	dijit.byId("appauthor"+this.instance+this.blah).setValue(this.app.author);
	dijit.byId("appemail"+this.instance+this.blah).setValue(this.app.email);
	dijit.byId("appversion"+this.instance+this.blah).setValue(this.app.version);
	dijit.byId("appcategory"+this.instance+this.blah).setValue(this.app.category);
	dijit.byId("appmaturity"+this.instance+this.blah).setValue(this.app.maturity);
}

this._editMetadata = function()
{
	this.app.name = dijit.byId("appname"+this.instance+this.blah).getValue();
	this.app.author = dijit.byId("appauthor"+this.instance+this.blah).getValue();
	this.app.email = dijit.byId("appemail"+this.instance+this.blah).getValue();
	this.app.version = dijit.byId("appversion"+this.instance+this.blah).getValue();
	this.app.category = dijit.byId("appcategory"+this.instance+this.blah).getValue();
	this.app.maturity = dijit.byId("appmaturity"+this.instance+this.blah).getValue();
	this.editor.value = this.tempCache;
        this.editor.disabled = false;
	this.blah++;
}

this.execute = function()
{
	api.ide.execute(this.editor.value);
}

this.load = function()
{
	//create a window with a list of apps to edit.
	api.ide.getAppList(dojo.hitch(this, function(data){
		this.loadwin = new api.window({title: "Select App", bodyWidget: "LayoutContainer"});
		var pane = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		content=document.createElement("ul");
		dojo.forEach(data, dojo.hitch(this, function(a){
			var l = document.createElement("li");
			l.href="javascript://";
			l.innerHTML=a.name+" "+a.version;
			l.title=a.id;
			l.style.cursor="pointer";
			dojo.connect(l, "onclick", this, function(e) {
				console.debug(this);
				this.loadwin.hide();
				api.ide.load(parseInt(e.target.title), dojo.hitch(this, function(data) {
					this.editor.value=data.code;
					this.app = data;
				}));
			});
			content.appendChild(l);
		}));
		pane.setContent(content);
		this.loadwin.addChild(pane);
		this.loadwin.show();
		this.loadwin.startup();
		
		new dijit.form.Button({label: "Open", onClick: dojo.hitch(this, function() {
			
		})});
	}));
}

this.onKey = function(e)
{
	if(e.keyCode == dojo.keys.TAB && !e.shiftKey && !e.ctrlKey && !e.altKey)
	{
		dojo.stopEvent(e);
		if (document.selection)
		{
			this.editor.focus();
			var sel = document.selection.createRange();
			sel.text = "	";
		}
		else if (this.editor.selectionStart || this.editor.selectionStart == '0')
		{
			var scroll = this.editor.scrollTop;
			var startPos = this.editor.selectionStart;
			var endPos = this.editor.selectionEnd;
			this.editor.value = this.editor.value.substring(0, startPos) + "	" + this.editor.value.substring(endPos, this.editor.value.length);
			this.editor.selectionStart = startPos+1;
			this.editor.selectionEnd = endPos+1;
			this.editor.scrollTop = scroll;
		} else {
			this.editor.value += "	";
		}
	}
}