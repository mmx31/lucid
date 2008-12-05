dojo.provide("desktop.apps.WordProcessor");
dojo.require("dijit.Toolbar");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Editor");
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("dijit._editor.plugins.FontChoice");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dijit._editor.plugins.TabIndent");
dojo.require("dojo.date");

dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop", "messages");

dojo.declare("desktop.apps.WordProcessor", desktop.apps._App, {
	newAs: false,
	editing: false,
	fileEditing: "",
	kill: function(){
	    if (!this.window.closed)
	        this.window.close();
	},
	init: function(args){
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var msg = dojo.i18n.getLocalization("desktop", "messages");
		
	    this.window = new desktop.widget.Window({
			title: app["Word Processor"],
			iconClass: this.iconClass,
	        onClose: dojo.hitch(this, this.kill)
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
	    var box = new dijit.layout.ContentPane({
	        region: "center"
	    },
	    document.createElement("div"));
	    this.statusbar = new desktop.widget.StatusBar({
	        region: "bottom"
	    });
	    this.statusbar.attr("label", msg.noFileOpen);
	    this.window.addChild(this.statusbar);
	    var editor = this.editor = new dijit.Editor({
	    	region: "center",
	    	extraPlugins: [
	    	    "|",
                "createLink",
                "insertImage",
                "|",
                "fontName",
                "fontSize",
                "formatBlock",
                "foreColor",
                "|",
                'tabIndent'
	    	],
            isTabIndent: true
	    }, document.body.appendChild(document.createElement("div")));
		editor.startup();
		this.window.addChild(editor);
	    this.window.show();
	    this._new = false;
	    this.window.startup();
	    this.window.onClose = dojo.hitch(this, this.kill);
	
		setTimeout(dojo.hitch(this, function(){
			editor = dijit.byId(editor.id);
			editor.extraPlugins = [];
			delete editor.toolbar;
			editor.postCreate();
			if(args.file) 
				this._processOpen(args.file);
			else {
				this.processNew();
			}
		}), 500);
	
	},
    updateTitle: function(path){
        var app = dojo.i18n.getLocalization("desktop", "apps");
        if(!path) return this.window.attr("title", app["Text Editor"]);
        var files = path.split("/");
        this.window.attr("title", files[files.length-1]+" - "+app["Text Editor"]);
    },
	processNew: function(){
		var msg = dojo.i18n.getLocalization("desktop", "messages");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
	    this.editor.setDisabled(false);
	    this.editor.replaceValue("");
	    this.editing = false;
	    this.fileEditing = "";
	    this.newAs = true;
	    this.statusbar.attr("label", msg.editingFile.replace("%s", cmn.untitled));
	    this.updateTitle(cmn.untitled);
	},
	processClose: function(){
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    this.editor.replaceValue("");
	    this.editor.setDisabled(true);
	    this.newAs = false;
	    this.editing = false;
	    this.fileEditing = "";
	    this.statusbar.attr("label", msg.noFileOpen);
	    this.updateTitle(false);
	},
	processOpen: function(){
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    desktop.dialog.file({
	        title: msg.chooseFileOpen,
		types: [{type: ".html"}],
	        onComplete: dojo.hitch(this, this._processOpen)
	    });
	
	},
	
	_processOpen: function(path){
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (path == false){
	        return false;
	    }
        this.updateTitle(path);
	    this.statusbar.attr("label", msg.openingFile.replace("%s", path));
	    this.newAs = true;
	    this.editor.setDisabled(true);
	    desktop.filesystem.readFileContents(path, dojo.hitch(this, function(content){
	            this.editor.setDisabled(false);
	            this.editor.replaceValue(content);
	            this.editing = true;
	            this.newAs = true;
	            this.fileEditing = path;
	            this.statusbar.attr("label", msg.editingFile.replace("%s", path));
        }));
	
	},
	
	processSave: function(){
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.editing){
            desktop.filesystem.writeFileContents(this.fileEditing, "<html>"+this.editor.getValue()+"</html>");
            var p = dojo.date.locale.format(new Date());
            this.statusbar.attr("label", msg.fileSaved+" ("+p+")");
	    }
	    else {
	        this.processSaveAs();
	
	    }
	
	},
	processSaveAs: function(){
		var msg = dojo.i18n.getLocalization("desktop", "messages");
	    if (this.newAs){
	        desktop.dialog.file({
	            title: msg.chooseFileSave,
	            onComplete: dojo.hitch(this, 
	            function(path){
	                if (path == false){
	                    return false;
	                }
	                this.editing = true;
	                this.fileEditing = path;
	                this.newAs = true;
	                this.processSave();
                    this.updateTitle(path);
	            })
	        });
	
	    }
	
	}
})
