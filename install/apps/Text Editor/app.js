({
	newAs: false,
	editing: false,
	fileEditing: "",
	
	kill: function() {
	    if (typeof(this.window) != "undefined") {
	        this.window.close();
	
	    }
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
	        onClose: dojo.hitch(this, this.kill)
	    });
	    var toolbar = new dijit.Toolbar({
	        layoutAlign: "top"
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
	    var box = new dijit.layout.ContentPane({
	        layoutAlign: "client",
			style: "overflow: hidden;"
	    },
	    document.createElement("div"));
	    this.other = new dijit.layout.ContentPane({
	        layoutAlign: "bottom"
	    },
	    document.createElement("div"));
		this.editor = document.createElement("textarea");
		dojo.style(this.editor, "width", "100%");
		dojo.style(this.editor, "height", "100%");
		dojo.style(this.editor, "border", "0px");
	    box.setContent(this.editor);
	    this.other.setContent(msg.noFileOpen);
	    this.window.addChild(box);
	    this.window.addChild(this.other);
	    this.window.width = "320px";
	    this.window.height = "305px";
	    this.window.show();
	    this.window.startup();
		if(args.file) this._processOpen(args.file);
		else this.processNew();
	},
	processNew: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
	    this.editor.disabled = false;
	    this.editor.value = "";
	    this.editing = false;
	    this.fileEditing = "";
	    this.newAs = true;
	    this.other.setContent(msg.editingFile.replace("%s", cm.untitled));
	
	},
	processClose: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.editor.disabled = true;
	    this.newAs = false;
	    this.editing = false;
	    this.fileEditing = "";
	    this.other.setContent(msg.noFileOpen);
	
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
	    this.other.setContent(msg.openingFile.replace("%s", path));
	    this.newAs = true;
	    this.editor.disabled = true;
	    api.fs.read({
	        path: path,
	        callback: dojo.hitch(this, function(array) {
	            this.editor.value = array.contents;
	            this.editing = true;
	            this.newAs = true;
	            this.editor.disabled = false;
	            this.fileEditing = path;
	            this.other.setContent(msg.editingFile.replace("%s", path));
	        })
	    });
	
	},
	
	processSave: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.editing) {
	        api.fs.write({
	            path: this.fileEditing,
	            content: this.editor.value
	        });
	        this.other.setContent(msg.fileSaved);
	
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