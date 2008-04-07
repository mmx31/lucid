({
	blah: 0,
	
	// this.changed - Bool - Whether current file or app has been modified
	changed: 0,
	
	// this.currentAppStr - String - Name and version of currently opened file or app
	currentAppStr: "",
	
	init: function(args)
	{
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dijit.form.Textarea");
		dojo.require("dijit.form.Button");
	    dojo.require("dijit.form.TextBox");
		dojo.require("dijit.Toolbar");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.win = new api.Window({
			title: app["Katana IDE"],
			onClose: dojo.hitch(this, this.kill)
		});
		
		var client = new dijit.layout.ContentPane({style: "overflow: hidden;", layoutAlign: "client"}, document.createElement("div"));
			this.editor = document.createElement("textarea");
			this.editor.style.width="100%";	
			this.editor.style.height="100%";
			this.editor.style.border="0px none";
			this.editor.style.margin="0px";
			dojo.connect(this.editor, "onkeypress", this, this.onKey);
			client.setContent(this.editor);
		this.win.addChild(client);
		
		this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
			this.toolbar.addChild(new dijit.form.Button({label: cm["new"], iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, function btnNewApp() { this.newApp(1); })}));
			this.toolbar.addChild(new dijit.form.Button({label: cm.open, iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, this.load)}));
			this.toolbar.addChild(new dijit.form.Button({label: cm.save, iconClass: "icon-16-actions-document-save", onClick: dojo.hitch(this, this.save)}));
			this.toolbar.addChild(new dijit.form.Button({label: "Metadata", iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.editMetadata)}));
	
		this.win.addChild(this.toolbar);
		this.win.show();
		this.win.startup();
		this.newApp();
	},
	
	kill: function()
	{
		if(typeof this.loadwin != "undefined") {
			if(!this.loadwin.closed) this.loadwin.close();
		}
		if(!this.win.closed)this.win.close();
	},
	
	newApp: function(showmeta)
	{
		if ( showmeta == null ) showmeta = 0;
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
		this.editor.value="this.init = function(args)\n{\n\n/*Insert application start code here*/\n\n}\n\nthis.kill = function()\n{\n\n/*Insert application end code here*/\n\n}";
	
		// Update app string for window title
		this.currentAppStr = this.app.name + " " + this.app.version;
		this.updateTitle();
	
		if ( showmeta == 1 ) this.editMetadata();
	},
	app: {},
	save: function()
	{
		this.editor.disabled = true;
		this.app.code=this.editor.value;
		this.app.callback = dojo.hitch(this, this.saved);
		this.app.error = dojo.hitch(this, function(one, two) {
		if(one == 7) api.ui.alertDialog({title: "Katana IDE", message:"Permissions error. Contact your administrator."});
		else api.ui.alertDialog({title: "Katana IDE", message:"Error: "+one+"<br>Please try again or report this bug."});
		});
		api.ide.save(this.app);
	},
	
	saved: function(id)
	{
		desktop.app.apps=[];
		api.ide.load(id, dojo.hitch(this, function(data) {
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
			delete this.app.callback;
		}));
	
		// Update title app string to reflect saved changes
		this.changed = 0;
		this.updateTitle();
	},
	spawnID: 0,
	editMetadata: function()
	{
		this.tempCache  = this.editor.value;
	        this.editor.value = "To continue working, close the metadata window.";
	        this.editor.disabled = true;
	        this.winn = new api.Window({
				title: "Edit Metadata",
				onClose: dojo.hitch(this, this._editMetadata)
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
		var body = new dijit.layout.ContentPane({layoutAlign: "client"});
		body.setContent(content);
		this.winn.addChild(body);
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
	},
	
	_editMetadata: function()
	{
		var anyChanged = 0;	// Has ANY meta data changed?
		var nameChanged = 0;	// Has app name been changed?
		var versionChanged = 0;	// Has app version been changed?
	
		if ( this.app.name != dijit.byId("appname"+this.instance+this.blah).getValue() ) {
			nameChanged = 1;
			anyChanged = 1;
		}
		if ( this.app.version != dijit.byId("appversion"+this.instance+this.blah).getValue() ) {
			versionChanged = 1;
			anyChanged = 1;
		}
		if ( this.app.author != dijit.byId("appauthor"+this.instance+this.blah).getValue() ) anyChanged = 1;
		if ( this.app.email != dijit.byId("appemail"+this.instance+this.blah).getValue() ) anyChanged = 1;
		if ( this.app.category != dijit.byId("appcategory"+this.instance+this.blah).getValue() ) anyChanged = 1;
		if ( this.app.maturity != dijit.byId("appmaturity"+this.instance+this.blah).getValue() ) anyChanged = 1;
		
		this.app.name = dijit.byId("appname"+this.instance+this.blah).getValue();
		this.app.author = dijit.byId("appauthor"+this.instance+this.blah).getValue();
		this.app.email = dijit.byId("appemail"+this.instance+this.blah).getValue();
		this.app.version = dijit.byId("appversion"+this.instance+this.blah).getValue();
		this.app.category = dijit.byId("appcategory"+this.instance+this.blah).getValue();
		this.app.maturity = dijit.byId("appmaturity"+this.instance+this.blah).getValue();
		this.editor.value = this.tempCache;
	        this.editor.disabled = false;
		this.blah++;
	
		if ( nameChanged == 1 || versionChanged == 1 ) {
			this.currentAppStr = this.app.name + " " + this.app.version;
		}
		if ( anyChanged == 1 ) {
			this.changed = 1;
			this.updateTitle();
		}
	},
	
	execute: function()
	{
		api.ui.alertDialog({title:"Katana IDE", message:this.editor.value});
		api.ide.execute(this.editor.value);
	},
	
	load: function()
	{
		//create a window with a list of apps to edit.
		api.ide.getAppList(dojo.hitch(this, function(data){
			this.loadwin = new api.Window({title: "Select App"});
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
					this.loadwin.close();
	
					// Update title app str to reflect new file
					this.currentAppStr = a.name + " " + a.version;
					this.changed = 0;
					this.updateTitle();
	
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
	},
	
	onKey: function(e)
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
		switch (e.keyCode) {
			case dojo.keys.UP_ARROW: break;
			case dojo.keys.DOWN_ARROW: break;
			case dojo.keys.LEFT_ARROW: break;
			case dojo.keys.RIGHT_ARROW: break;
			case dojo.keys.PAGE_UP: break;
			case dojo.keys.PAGE_DOWN: break;
			case dojo.keys.ESCAPE: break;
			case dojo.keys.HOME: break;
			case dojo.keys.END: break;
			case dojo.keys.INSERT: break;
			default:
				if ( e.ctrlKey || e.altKey ) break;
				// Update title app str to reflect new unsaved changes
				this.changed = 1;
				this.updateTitle();
				break;
		}
	},
	
	updateTitle: function() {
		var titleStr = "Katana IDE - ";
		titleStr += this.currentAppStr;
		if ( this.changed == 1 ) {
			titleStr += " (+)";
		}
		this.win.setTitle( titleStr );
	}
})