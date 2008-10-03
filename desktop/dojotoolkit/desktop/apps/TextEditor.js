dojo.provide("desktop.apps.TextEditor")
dojo.require("dijit.form.SimpleTextarea");

dojo.declare("desktop.apps.TextEditor", desktop.apps._App, {
	newAs: false,
	editing: false,
	fileEditing: "",
	
	kill: function() {
	    if(!this.window.closed)
	        this.window.close();
	},
	
	init: function(args) {
	    dojo.require("dijit.Toolbar");
	    dojo.require("dijit.layout.ContentPane");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
		dojo.requireLocalization("desktop", "messages");
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var msg = dojo.i18n.getLocalization("desktop", "messages");
		
	    this.window = new api.Window({
			title: app["Text Editor"],
			iconClass: this.iconClass,
	        onClose: dojo.hitch(this, "kill")
	    });
	    var toolbar = new dijit.Toolbar({
	        region: "top"
	    });
	    toolbar.addChild(new dijit.form.Button({
	        label: cm["new"],
	        onClick: dojo.hitch(this, this.processNew),
	        iconClass: "icon-16-actions-document-open"
	    }));
	    toolbar.addChild(new dijit.form.Button({
	        label: cm.open,
	        onClick: dojo.hitch(this, this.processOpen),
	        iconClass: "icon-16-actions-document-open"
	    }));
	    toolbar.addChild(new dijit.form.Button({
	        label: cm.save,
	        onClick: dojo.hitch(this, this.processSave),
	        iconClass: "icon-16-actions-document-save"
	    }));
	    toolbar.addChild(new dijit.form.Button({
	        label: cm.saveAs,
	        onClick: dojo.hitch(this, this.processSaveAs),
	        iconClass: "icon-16-actions-document-save-as"
	    }));
	    toolbar.addChild(new dijit.form.Button({
	        label: cm.close,
	        onClick: dojo.hitch(this, this.processClose),
	        iconClass: "icon-16-actions-process-stop"
	    }));
	    this.window.addChild(toolbar);
	    this.statusbar = new api.StatusBar({
	        region: "bottom"
	    });
		this.editor = new dijit.form.SimpleTextarea({
			region: "center"
		});
	    this.statusbar.attr("label", msg.noFileOpen);
	    this.window.addChild(this.editor);
	    this.window.addChild(this.statusbar);
	    this.editor.setDisabled(true);
	    this.window.show();
	    this.window.startup();
		if(args.file) this._processOpen(args.file);
		else this.processNew();
	},
	processNew: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
		var cm = dojo.i18n.getLocalization("desktop", "common");
	    this.editor.setDisabled(false);
	    this.editor.setValue("");
	    this.editing = false;
	    this.fileEditing = "";
	    this.newAs = true;
	    this.statusbar.attr("label", msg.editingFile.replace("%s", cm.untitled));
	
	},
	processClose: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.editor.setDisabled(true);
		this.editor.setValue("");
	    this.newAs = false;
	    this.editing = false;
	    this.fileEditing = "";
	    this.statusbar.attr("label", msg.noFileOpen);
	
	},
	processOpen: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    api.ui.fileDialog({
	        title: msg.chooseFileOpen,
	        callback: dojo.hitch(this, "_processOpen")
	    });
	
	},
	
	_processOpen: function(path) {
	    if (path == false) {
	        return false;
	    }
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.statusbar.attr("label", msg.openingFile.replace("%s", path));
	    this.newAs = true;
	    this.editor.setDisabled(true);
	    api.filesystem.readFileContents(path, dojo.hitch(this, function(content) {
			this.editor.setValue(content);
            this.editing = true;
            this.newAs = true;
            this.editor.setDisabled(false);
            this.fileEditing = path;
            this.statusbar.attr("label", msg.editingFile.replace("%s", path));
        }));
	
	},
	
	processSave: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.editing) {
	        api.filesystem.writeFileContents(this.fileEditing, this.editor.getValue());
	        this.statusbar.attr("label", msg.fileSaved);
	
	    }
	    else {
	        this.processSaveAs();
	
	    }
	
	},
	processSaveAs: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.newAs) {
	        api.ui.fileDialog({
	            title: msg.chooseFileSave,
	            callback: dojo.hitch(this, 
	            function(path) {
	                if (path == false) {
	                    return false;
	                }
	                this.editing = true;
	                this.fileEditing = path;
	                this.newAs = true;
	                this.processSave();
	            })
	        });
	
	    }
	
	}
})
