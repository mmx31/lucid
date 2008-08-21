dojo.provide("desktop.apps.TextEditor")

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
	    this.other = new dijit.layout.ContentPane({
	        region: "bottom"
	    },
	    document.createElement("div"));
		this.editor = new desktop.apps.TextEditor.EditorWidget({
			region: "center"
		});
	    this.other.setContent(msg.noFileOpen);
	    this.window.addChild(this.editor);
	    this.window.addChild(this.other);
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
	    this.other.setContent(msg.editingFile.replace("%s", cm.untitled));
	
	},
	processClose: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.editor.setDisabled(true);
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
	    this.editor.setDisabled(true);
	    api.filesystem.readFileContents(path, dojo.hitch(this, function(content) {
			this.editor.setValue(content);
            this.editing = true;
            this.newAs = true;
            this.editor.setDisabled(false);
            this.fileEditing = path;
            this.other.setContent(msg.editingFile.replace("%s", path));
        }));
	
	},
	
	processSave: function() {
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.editing) {
	        api.filesystem.writeFileContents(this.fileEditing, this.editor.getValue());
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

dojo.declare("desktop.apps.TextEditor.EditorWidget", [dijit._Widget, dijit._Templated], {
	//just a dummy textarea widget
	templateString: "<textarea style='border: 0px;'></textarea>",
	setDisabled: function(d) {
		this.domNode.disabled=d;
	},
	getValue: function() {
		return this.domNode.value;
	},
	setValue: function(str) {
		this.domNode.value = str;
	}
});
