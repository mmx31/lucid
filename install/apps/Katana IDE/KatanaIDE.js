dojo.provide("desktop.apps.KatanaIDE");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Tree");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop.ui", "menus");
dojo.requireLocalization("desktop", "system");

dojo.declare("desktop.apps.KatanaIDE", desktop.apps._App, {
	files: [], //file information
	init: function(args) {
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		this.win = new api.Window({
			title: app["Katana IDE"],
			onClose: dojo.hitch(this, "kill")
		});
		
		var client = new dijit.layout.SplitContainer({
			layoutAlign: "client"
		});
		var right = this.tabArea = new dijit.layout.TabContainer({
			sizeShare: 70
		});
		desktop.app.list(dojo.hitch(this, function(apps) {
			for(var i in apps) {
				if(apps[i].filename) continue;
				var files = apps[i].files;
				delete apps[i].files;
				var children = [];
				for(var f in files) {
					var fileItem = {
						sysname: apps[i].sysname+files[f],
						name: files[f],
						label: files[f].substring(files[f].lastIndexOf("/", files[f].length)) || files[f],
						filename: files[f],
						appname: apps[i].sysname
					}
					apps.push(fileItem);
					children.push({
						_reference: apps[i].sysname+files[f]
					})
				}
				apps[i].children = children;
			}
			var appStore = this.appStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "sysname",
					label: "name",
					items: apps
				}
			});
			var left = new dijit.Tree({
				store: appStore,
				query: {category: "*"},
				sizeMin: 0,
				sizeShare: 30
			})
			dojo.connect(left, "onClick", this, "onItem");
			client.addChild(left);
			client.addChild(right);
		}));
		
		this.win.addChild(client);
		this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
//			this.toolbar.addChild(new dijit.form.Button({label: cm["new"], iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, "newApp", 1)}));
//			this.toolbar.addChild(new dijit.form.Button({label: cm.open, iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, "load")}));
//			this.toolbar.addChild(new dijit.form.Button({label: cm.save, iconClass: "icon-16-actions-document-save", onClick: dojo.hitch(this, "save")}));
//			this.toolbar.addChild(new dijit.form.Button({label: cm.metadata, iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, "editMetadata")}));
			this.toolbar.addChild(new dijit.form.Button({label: cm.run, iconClass: "icon-16-actions-media-playback-start", onClick: dojo.hitch(this, "run")}));
			this.toolbar.addChild(new dijit.form.Button({label: sys.kill, iconClass: "icon-16-actions-media-playback-stop", onClick: dojo.hitch(this, "killExec")}));
	
		this.win.addChild(this.toolbar);
		this.win.show();
		this.win.startup();
		
	},
	makeTab: function(appname, filename, content) {
		var div = dojo.doc.createElement("div");
		dojo.style(div, {
			width: "100%",
			height: "100%",
			overflow: "hidden"
		});
		
		var editor = new desktop.apps.KatanaIDE.CodeTextArea({
			width: "100%",
			height: "100%",
			plugins: "BlinkingCaret GoToLineDialog Bookmarks MatchingBrackets",
			colorsUrl: dojo.moduleUrl("desktop.apps.KatanaIDE.data", "javascript_dojo_color.json"),
			autocompleteUrl: dojo.moduleUrl("desktop.apps.KatanaIDE.data", "javascript_dojo_ac.json")
		});
		div.appendChild(editor.domNode);
		
		var cpane = new dijit.layout.ContentPane({
			closable: true,
			title: filename.substring(filename.lastIndexOf("/")+1) || filename,
			ide_info: {
				fileName: filename,
				appName: appname,
				editor: editor
			}
		});
		
		cpane.setContent(div);
		this.tabArea.addChild(cpane);
		this.tabArea.selectChild(cpane);
		editor.startup();
		editor.massiveWrite(content);
		editor.setCaretPosition(0, 0); 
		setTimeout(dojo.hitch(this.tabArea, "layout"), 100);
	},
	_newApp: function(name) {
		this.makeTab(name, "/"+name+".js","dojo.provide(\"desktop.apps."+name+"\");\r\n\r\n"
								+"dojo.declare(\"desktop.apps."+name+"\", desktop.apps._App, {\r\n"
								+"	init: function(args) {\r\n"
								+"		/*Startup code goes here*/\r\n"
								+"	}\r\n"
								+"	kill: function(args) {\r\n"
								+"		/*Cleanup code goes here*/\r\n"
								+"	}\r\n"
								+"});");
	},
	onItem: function(item) {
		var store = this.appStore;
		if(!store.isItem(item)) return;
		var filename = store.getValue(item, "filename");
		if(!filename) return;
		var app = store.getValue(item, "appname");
		var tac = this.tabArea.getChildren();
		for(var i in tac) {
			if(typeof tac[i] != "object") continue;
			if(tac[i].ide_info.fileName == filename && tac[i].ide_info.appName == app) {
				return this.tabArea.selectChild(tac[i]);
			}
		}
		desktop.app.get(app, filename, dojo.hitch(this, function(content) {
			this.makeTab(app, filename, content);
		}))
	},
	save: function() {
		var pane = this.tabArea.selectedChildWidget;
		
	},
	run: function()
	{
		desktop.app.execString(this.editor.value);
	},
	
	killExec: function() {
		for(key in desktop.app.instances) {
			var instance = desktop.app.instances[key];
			if(!instance) continue;
			if(instance.id == -1) desktop.app.kill(instance.instance);
		}
	},

	kill: function()
	{
		if(typeof this.loadwin != "undefined") {
			if(!this.loadwin.closed) this.loadwin.close();
		}
		if(!this.win.closed)this.win.close();
		this.killExec();
	}
});

dojo.require("desktop.apps.KatanaIDE.CodeTextArea");
api.addDojoCss("desktop/apps/KatanaIDE/codeEditor.css");