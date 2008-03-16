this.kill = function() {
	if(!this.win.closed) this.win.close();
	if(this.timer) clearInterval(this.timer);
}
this.imgNode = false;
this.init = function(args) {
	dojo.require("dijit.Toolbar");
	dojo.require("dojox.layout.DragPane");
	this.win = new api.window({
		title: "Image Viewer",
		onClose: dojo.hitch(this, "kill")
	});
	var toolbar = new dijit.Toolbar({layoutAlign: "top"});
	dojo.forEach([
		{
			label: "Open",
	        iconClass: "icon-16-actions-document-open",
			onClick: dojo.hitch(this, function() {
				api.ui.fileDialog({
					title: "Choose an image to open",
					callback: dojo.hitch(this, "open")
				});
			})
		}
	], function(a) {
		toolbar.addChild(new dijit.form.Button(a));
	});
	this.win.addChild(toolbar);
	this.dragPane = new dojox.layout.DragPane({layoutAlign: "client", style: "overflow: scroll;"});
	this.win.addChild(this.dragPane);
	this.win.show();
	this.win.startup();
	if(typeof args.file != "undefined") this.open(args.file);
}
this.timer = false;
this.open = function(path) {
	if(!this.imgNode) {
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

		this.timer = setInterval(dojo.hitch(this, function() {
			dojo.style(overlay, "width", this.dragPane.domNode.scrollWidth+"px");
			dojo.style(overlay, "height", this.dragPane.domNode.scrollHeight+"px");
		}), 1000);
		
		this.dragPane.domNode.appendChild(this.imgNode);
	}
	dojo.query("img", this.imgNode)[0].src = api.fs.embed(path);
}
