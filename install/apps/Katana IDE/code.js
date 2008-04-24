({
	// this.changed - Bool - Whether current file or app has been modified
	changed: 0,
	
	// this.currentAppStr - String - Name and version of currently opened file or app
	currentAppStr: "",
	
	metaUi: {}, //metadata input widgets
	
	init: function(args)
	{
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dijit.form.Textarea");
		dojo.require("dijit.form.Button");
	    dojo.require("dijit.form.TextBox");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.form.FilteringSelect");
		dojo.require("dojo.data.ItemFileReadStore");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
		dojo.requireLocalization("desktop.ui", "menus");
		dojo.requireLocalization("desktop", "system");
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		this.win = new api.Window({
			title: app["Katana IDE"],
			onClose: dojo.hitch(this, "kill")
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
			this.toolbar.addChild(new dijit.form.Button({label: cm.metadata, iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.editMetadata)}));
			this.toolbar.addChild(new dijit.form.Button({label: cm.run, iconClass: "icon-16-actions-media-playback-start", onClick: dojo.hitch(this, this.run)}));
			this.toolbar.addChild(new dijit.form.Button({label: sys.kill, iconClass: "icon-16-actions-media-playback-stop", onClick: dojo.hitch(this, function() {
				for(key in desktop.app.instances) {
					var instance = desktop.app.instances[key];
					if(!instance) continue;
					if(instance.id == -1) desktop.app.kill(instance.instance);
				}
			})}));
	
		this.win.addChild(this.toolbar);
		this.win.show();
		this.win.startup();
		this.newApp();
	},
	
	run: function()
	{
		desktop.app.execString(this.editor.value);
	},

	kill: function()
	{
		if(typeof this.loadwin != "undefined") {
			if(!this.loadwin.closed) this.loadwin.close();
		}
		if(!this.win.closed)this.win.close();
		desktop.app.kill(-1);
	},
	
	newApp: function(showmeta)
	{
		if ( showmeta == null ) showmeta = 0;
		this.app = {
			id: -1,
			code: "",
			name: "New App",
			email: "AppCreator@example.com",
			version: "1.0",
			category: "Accessories",
			maturity: "Alpha",
			author: "NewApp Creator"
		};
		this.editor.value="({\n\n\tinit: function(args)\n\t{\n\n\t\t/*Insert application start code here*/\n\n\t},\n\n\tkill: function()\n\t{\n\n\t\t/*Insert application end code here*/\n\n\t}\n\n})";
	
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
		desktop.app.save(this.app);
	},
	
	saved: function(id)
	{
		desktop.app.apps=[];
		desktop.app.get(id, dojo.hitch(this, function(data) {
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
		//TODO: this really shouldn't use IDs.
		var mnu = dojo.i18n.getLocalization("desktop.ui", "menus");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		this.tempCache  = this.editor.value;
	        this.winn = new api.Window({
				title: "Edit Metadata",
				width: "450px",
				height: "250px",
				onClose: dojo.hitch(this, this._editMetadata)
			});
			var div = document.createElement("div");
			
			var row = document.createElement("div");
			row.textContent = sys.id+": "+(this.app.id == -1 ? sys.notAssigned : this.app.id);
			div.appendChild(row);
			
			var row = document.createElement("div");
			row.textContent = sys.name+": ";
			this.metaUi.name = new dijit.form.TextBox({value: this.app.name});
			row.appendChild(this.metaUi.name.domNode);
			div.appendChild(row);
			
			var row = document.createElement("div");
			row.textContent = sys.author+": ";
			this.metaUi.author = new dijit.form.TextBox({value: this.app.author});
			row.appendChild(this.metaUi.author.domNode);
			div.appendChild(row);
			
			var row = document.createElement("div");
			row.textContent = sys.email+": ";
			this.metaUi.email = new dijit.form.TextBox({value: this.app.email});
			row.appendChild(this.metaUi.email.domNode);
			div.appendChild(row);
			
			var row = document.createElement("div");
			row.textContent = sys.version+": ";
			this.metaUi.version = new dijit.form.TextBox({value: this.app.version});
			row.appendChild(this.metaUi.version.domNode);
			div.appendChild(row);
			
			var row = document.createElement("div");
			row.textContent = sys.maturity+": ";
			this.metaUi.maturity = new dijit.form.TextBox({value: this.app.maturity});
			row.appendChild(this.metaUi.maturity.domNode);
			div.appendChild(row);
			
			var row = document.createElement("div");
			row.textContent = sys.category+": ";
			this.metaUi.category = new dijit.form.FilteringSelect({
				autoComplete: true,
				searchAttr: "label",
				value: this.app.category,
				store: new dojo.data.ItemFileReadStore({
					data: {
						identifier: "value",
						items: [
							{ label: mnu.accessories, value: "Accessories" },
							{ label: mnu.development, value: "Development" },
							{ label: mnu.games, value: "Games" },
							{ label: mnu.graphics, value: "Graphics" },
							{ label: mnu.internet, value: "Internet" },
							{ label: mnu.multimedia, value: "Multimedia" },
							{ label: mnu.office, value: "Office" },
							{ label: mnu.system, value: "System" }
						]
					}
				}),
				onChange: dojo.hitch( this, function(val) {
					if ( typeof val == "undefined" ) return;
				})
			});
			row.appendChild(this.metaUi.category.domNode);
			div.appendChild(row);
			
		var body = new dijit.layout.ContentPane({layoutAlign: "client"});
		body.setContent(div);
		this.winn.addChild(body);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom"});
		var div = document.createElement("div");
		dojo.addClass(div, "floatRight");
		var closeButton = new dijit.form.Button({
			label: cmn.save,
			onClick: dojo.hitch(this.winn, "close")
		});
		div.appendChild(closeButton.domNode);
		bottom.setContent(div);
		this.winn.addChild(bottom);
		this.winn.show();
	},
	
	_editMetadata: function()
	{
		var anyChanged = 0;	// Has ANY meta data changed?
		var nameChanged = 0;	// Has app name been changed?
		var versionChanged = 0;	// Has app version been changed?
	
		if ( this.app.name != this.appUi.name.getValue() ) {
			nameChanged = 1;
			anyChanged = 1;
		}
		if ( this.app.version != this.appUi.version.getValue() ) {
			versionChanged = 1;
			anyChanged = 1;
		}
		if ( this.app.author != this.appUi.author.getValue() ) anyChanged = 1;
		if ( this.app.email != this.appUi.email.getValue() ) anyChanged = 1;
		if ( this.app.category != this.appUi.category.getValue() ) anyChanged = 1;
		if ( this.app.maturity != this.appUi.maturity.getValue() ) anyChanged = 1;
		
		this.app.name = this.appUi.name.getValue();
		this.app.author = this.appUi.author.getValue();
		this.app.email = this.appUi.email.getValue();
		this.app.version = this.appUi.version.getValue();
		this.app.category = this.appUi.category.getValue();
		this.app.maturity = this.appUi.maturity.getValue();
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
	
	load: function()
	{
		var app = dojo.i18n.getLocalization("desktop", "apps");
		//create a window with a list of apps to edit.
		var data = desktop.app.appList;
		this.loadwin = new api.Window({title: "Select App"});
		var pane = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
		content=document.createElement("ul");
		dojo.forEach(data, dojo.hitch(this, function(a){
			var l = document.createElement("li");
			l.href="javascript:void(0);";
			l.innerHTML=(app[a.name] || a.name) + " (" + a.version + " " + a.maturity + ")";
			l.title=a.id;
			l.style.cursor="pointer";
			dojo.connect(l, "onclick", this, function(e) {
				console.debug(this);
				this.loadwin.close();

				// Update title app str to reflect new file
				this.currentAppStr = (app[a.name] || a.name) + " (" + a.version + " " + a.maturity + ")";
				this.changed = 0;
				this.updateTitle();

				desktop.app.get(parseInt(e.target.title), dojo.hitch(this, function(data) {
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
