({
	newAs: false,
	editing: false,
	fileEditing: "",
	
	init: function(args) {
	    dojo.require("dijit.Toolbar");
	    dojo.require("dijit.layout.ContentPane");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
	    if (args.file) {
	        this.start();
	        this._processOpen(args.file);
	
	    }
	    else {
	        this.start();
	
	    }
	
	},
	
	kill: function() {
	    if (typeof(this.window) != "undefined") {
	        this.window.close();
	
	    }
	},
	
	start: function() {
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
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
	        layoutAlign: "bottom",
	        style: "height: 10%"
	    },
	    document.createElement("div"));
		this.editor = document.createElement("textarea");
		dojo.style(this.editor, "width", "100%");
		dojo.style(this.editor, "height", "100%");
		dojo.style(this.editor, "border", "0px");
	    box.setContent(this.editor);
	    this.other.setContent("No file open");
	    this.window.addChild(box);
	    this.window.addChild(this.other);
	    this.window.width = "320px";
	    this.window.height = "305px";
	    this.window.show();
	    this.window.startup();
		this.processNew();
	},
	processNew: function() {
	    this.editor.disabled = false;
	    this.editor.value = "";
	    this.editing = false;
	    this.fileEditing = "";
	    this.newAs = true;
	    this.other.setContent("Editing file \"Untitled\"");
	
	},
	processClose: function() {
	    this.editor.disabled = true;
	    this.editor.value = "open or create a new file.";
	    this.newAs = false;
	    this.editing = false;
	    this.fileEditing = "";
	    this.other.setContent("No file open");
	
	},
	processOpen: function() {
	    this.other.setContent("Opened file dialog");
	    api.ui.fileDialog({
	        title: "Choose a file to open",
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
	    this.editor.disabled = true;
	    api.fs.read({
	        path: path,
	        callback: dojo.hitch(this, 
	        function(array) {
	            this.editor.value = array.contents;
	            this.editing = true;
	            this.newAs = true;
	            this.editor.disabled = false;
	            this.fileEditing = array.path;
	            this.other.setContent("Editing file \"" + array.path + "\"");
	
	        })
	    });
	
	},
	
	processSave: function() {
	    if (this.editing) {
	        api.fs.write({
	            path: this.fileEditing,
	            content: this.editor.value
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