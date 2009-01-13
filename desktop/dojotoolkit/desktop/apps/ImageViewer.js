dojo.provide("desktop.apps.ImageViewer");

dojo.declare("desktop.apps.ImageViewer", desktop.apps._App, {
	kill: function(){
		if(!this.win.closed) this.win.close();
		if(this.timer) clearInterval(this.timer);
	},
	imgNode: false,
	init: function(args){
		dojo.require("dijit.Toolbar");
		dojo.require("dojox.layout.DragPane");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.win = new desktop.widget.Window({
			title: app["Image Viewer"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		var toolbar = new dijit.Toolbar({region: "top"});
		dojo.forEach([
			{
				label: cm.open,
		        iconClass: "icon-16-actions-document-open",
				onClick: dojo.hitch(this, function(){
					desktop.dialog.file({
						title: "Choose an image to open",
						onComplete: dojo.hitch(this, "open")
					});
				})
			}
		], function(a){
			toolbar.addChild(new dijit.form.Button(a));
		});
		this.win.addChild(toolbar);
		this.dragPane = new dojox.layout.DragPane({region: "center", style: "overflow: auto;"});
		this.win.addChild(this.dragPane);
		this.win.show();
		this.win.startup();
		if(typeof args.file != "undefined") this.open(args.file);
	},
	timer: false,
	open: function(path){
		if(!this.imgNode){
			this.imgNode = document.createElement("div");
			var img = document.createElement("img");
			this.imgNode.appendChild(img);
			var overlay = document.createElement("div");
			dojo.style(overlay, "width", "100%");
			dojo.style(overlay, "height", "100%");
			dojo.style(overlay, "position", "absolute");
			dojo.style(overlay, "top", "0px");
			dojo.style(overlay, "left", "0px");
			dojo.style(overlay, "zIndex", "100");
			this.imgNode.appendChild(overlay);
	
			this.timer = setInterval(dojo.hitch(this, function(){
				dojo.style(overlay, "width", this.dragPane.domNode.scrollWidth+"px");
				dojo.style(overlay, "height", this.dragPane.domNode.scrollHeight+"px");
			}), 1000);
			
			this.dragPane.domNode.appendChild(this.imgNode);
		}
		dojo.query("img", this.imgNode)[0].src = desktop.filesystem.embed(path);
        dojo.query("*", this.imgNode).style({
            "MozUserFocus": "ignore",
            "MozUserInput": "disabled",
            "MozUserSelect": "none"
        });
        //update win title
        var app = dojo.i18n.getLocalization("desktop", "apps");
        var files = path.split("/");
        this.win.attr("title", files[files.length-1]+" - "+app["Image Viewer"]);
	}
})
