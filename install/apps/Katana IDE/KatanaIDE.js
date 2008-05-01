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
		var appStore = this.appStore = new dojo.data.ItemFileWriteStore({
			data: {
				identity: "sysname",
				label: "name",
				items: desktop.app.appList
			}
		});
		var left = new dijit.Tree({
			store: appStore
		})
		client.addChild(left);
		
		var right = this.tabArea = new dijit.layout.TabContainer({});
		client.addChild(right);
		
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
		
		this.makeTab("NewApp.js","dojo.provide(\"desktop.apps.NewApp\");\r\n\r\n"
								+"dojo.declare(\"desktop.apps.NewApp\", desktop.apps._App, {\r\n"
								+"	init: function(args) {\r\n",
								+"		/*Startup code goes here*/\r\n"
								+"	}\r\n"
								+"	kill: function(args) {\r\n",
								+"		/*Cleanup code goes here*/\r\n"
								+"	}\r\n");
	},
	makeTab: function(filename, content) {
		var editor = new desktop.apps.KatanaIDE.CodeTextArea({
			closable: true,
			title: filename.substring(filename.lastIndexOf("/", filename.length)) || filename
		})
		this.tabArea.addChild(editor);
		editor.write(content, false);
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