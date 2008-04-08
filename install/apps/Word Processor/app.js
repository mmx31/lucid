({
	newAs: false,
	editing: false,
	fileEditing: "",
	kill: function() {
	    if (!this.window.closed) {
	        this.window.close();
	    }
	},
	init: function(args) {
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dojo.parser");
		dojo.require("dijit.Editor");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
		dojo.requireLocalization("desktop", "messages");
		
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var msg = dojo.i18n.getLocalization("desktop", "messages");
		
	    this.window = new api.Window({
			title: app["Word Processor"],
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
	        layoutAlign: "client"
	    },
	    document.createElement("div"));
	    this.other = new dijit.layout.ContentPane({
	        layoutAlign: "bottom",
			style: "padding: 2px;"
	    },
	    document.createElement("div"));
	    this.other.setContent(msg.noFileOpen);
	    this.window.addChild(this.other);
	    var editor = this.editor = new dijit.Editor({layoutAlign: "client"}, document.body.appendChild(document.createElement("div")));
		editor.startup();
		this.window.addChild(editor);
	    this.window.show();
	    this._new = false;
	    this.window.startup();
	    this.window.onClose = dojo.hitch(this, this.kill);
	
		setTimeout(dojo.hitch(this, function() {
			editor = dijit.byId(editor.id);
			delete editor.toolbar;
			editor.postCreate();
			if(args.file) 
				this._processOpen(args.file);
			else {
				this.processNew();
			}
		}), 500);
	
	},
	processNew: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.editor.setDisabled(false);
	    this.editor.replaceValue("");
	    this.editing = false;
	    this.fileEditing = "";
	    this.newAs = true;
	    this.other.setContent(msg.editingFile.replace("%s", "Untitled"));
	
	},
	processClose: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.editor.setDisabled(true);
	    this.editor.replaceValue("");
	    this.newAs = false;
	    this.editing = false;
	    this.fileEditing = "";
	    this.other.setContent(msg.noFileOpen);
	
	},
	processOpen: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    api.ui.fileDialog({
	        title: msg.chooseFileOpen,
		types: [{type: ".html"}],
	        callback: dojo.hitch(this, this._processOpen)
	    });
	
	},
	
	_processOpen: function(path) {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (path == false) {
	        return false;
	    }
	    this.other.setContent(msg.openingFile.replace("%s", path));
	    this.newAs = true;
	    this.editor.setDisabled(true);
	    api.fs.read({
	        path: path,
	        callback: dojo.hitch(this, 
	        function(array) {
	            this.editor.setDisabled(false);
	            this.editor.replaceValue(array.contents);
	            this.editing = true;
	            this.newAs = true;
	            this.fileEditing = array.path;
	            this.other.setContent(msg.editingFile.replace("%s", array.path));
	        })
	    });
	
	},
	
	processSave: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.editing) {
        api.fs.write({
            path: this.fileEditing,
            content: "<html>"+this.editor.getValue()+"</html>"
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