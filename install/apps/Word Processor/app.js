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
		
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		
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
	    this.other.setContent("No file open");
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
	    this.editor.setDisabled(false);
	    this.editor.replaceValue("");
	    this.editing = false;
	    this.fileEditing = "";
	    this.newAs = true;
	    this.other.setContent("Editing file \"Untitled\"");
	
	},
	processClose: function() {
	    this.editor.setDisabled(true);
	    this.editor.replaceValue("");
	    this.newAs = false;
	    this.editing = false;
	    this.fileEditing = "";
	    this.other.setContent("No file open");
	
	},
	processOpen: function() {
	    this.other.setContent("Opened file dialog");
	    api.ui.fileDialog({
	        title: "Choose a file to open",
		types: [{type: ".html"}],
	        callback: dojo.hitch(this, this._processOpen)
	    });
	
	},
	
	_processOpen: function(path) {
	    if (path == false) {
	        this.other.setContent("Open canceled");
	        return false;
	    }
	    this.other.setContent("Opening file \"" + path + "\"");
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
	            this.other.setContent("Editing file \"" + array.path + "\"");
	
	        })
	    });
	
	},
	
	processSave: function() {
	    if (this.editing) {
        api.fs.write({
            path: this.fileEditing,
            content: "<html>"+this.editor.getValue()+"</html>"
        });
        this.other.setContent("File saved!");

    }
    else {
        this.processSaveAs();

    }

},
processSaveAs: function() {
    if (this.newAs) {
        api.ui.fileDialog({
            title: "Choose a file to save as",
            callback: dojo.hitch(this, 
            function(path) {
                if (path == false) {
                    this.other.setContent("Save canceled");
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