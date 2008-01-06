this.init = function(args) {
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	this.win = new api.window({
		title: "Music Player",
		width: "200px",
		height: "150px",
		bodyWidget: "LayoutContainer",
		onClose: dojo.hitch(this, this.kill)
	});
	var toolbar = new dijit.Toolbar({layoutAlign: "top"});
	dojo.forEach([
		{
			label: "Open",
			iconClass: "icon-16-actions-document-open",
			onClick: dojo.hitch(this, this.openDialog)
		}
	], function(item) {
		toolbar.addChild(new dijit.form.Button(item));
	})
	this.win.addChild(toolbar);
	this.ui = {
		play: new dijit.form.Button({
			iconClass: "icon-32-actions-media-playback-start",
			onClick: dojo.hitch(this, this.play),
			showLabel: false,
			label: "play"
		}),
		stop: new dijit.form.Button({
			iconClass: "icon-32-actions-media-playback-stop",
			onClick: dojo.hitch(this, this.stop),
			showLabel: false,
			label: "stop"
		})
	};
	var client = new dijit.Toolbar({layoutAlign: "client"});
	for(item in this.ui) {
		item = this.ui[item];
		if(item.declaredClass = "dijit.form.Button") {
			dojo.style(item.domNode, "width", "40px");
		}
		client.addChild(item);
		item.startup();
	}
	this.win.addChild(client);
	this.win.show();
	this.win.startup();
	api.instances.setActive(this.instance);
	if(args.file) this.open(args.file);
}
this.sound = false;
this.play = function() {
	if(this.sound) {
		this.sound.play();
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		this.ui.play.setLabel("pause");
		this.ui.play.onClick = dojo.hitch(this, this.pause);
		this.ui.play.startup();
	}
}
this.pause = function() {
	if(this.sound) {
		this.sound.pause();
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		this.ui.play.setLabel("play");
		this.ui.play.onClick = dojo.hitch(this, this.play)
	}
}
this.stop = function() {
	if(this.sound) {
		this.sound.stop();
	}
}
this.openDialog = function() {
	api.ui.fileDialog({
		title: "Select audio file to open",
		callback: dojo.hitch(this, this.open)
	});
}
this.open = function(file) {
	if (file) {
		this.sound = new api.sound({
			src: api.fs.embed(file)
		});
		this.play();
	}
}
this.kill = function() {
	if(!this.win.closed) this.win.close();
	if(this.sound) this.sound.destroy();
	api.instances.setKilled(this.instance);
}
