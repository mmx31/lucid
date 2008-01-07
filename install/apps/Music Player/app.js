this.init = function(args) {
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.Slider");
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.layout.ContentPane");
	this.win = new api.window({
		title: "Music Player",
		width: "350px",
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
		}),
		ticker: document.createElement("div"),
		slider: new dijit.form.HorizontalSlider({
			showButtons: false,
			style: "width: 100%;",
			onChange: dojo.hitch(this, this.skip)
		})
	};
	dojo.connect(this.ui.slider.domNode, "onmousedown", this, function() {
		this.stopTicker();
	});
	var ticker = this.ui.ticker;
	dojo.forEach([
		{p: "border", v: "1px solid gray"},
		{p: "backgroundColor", v: "black"},
		{p: "color", v: "gray"}
	], function(a){
		dojo.style(ticker, a.p, a.v);
	});
	ticker.innerHTML = "&nbsp;0:00/00:00&nbsp;";
	var client = new dijit.Toolbar({layoutAlign: "client"});
	for(item in this.ui) {
		var name = item;
		item = this.ui[item];
		if(item.declaredClass == "dijit.form.Button") {
			dojo.style(item.domNode, "width", "40px");
		}
		if (item.declaredClass) {
			client.addChild(item);
		}
		else {
			var box = this.box = new dijit.layout.ContentPane({}, item);
			client.addChild(box);
			dojo.removeClass(box.domNode, "dijitContentPane");
			dojo.addClass(box.domNode, "dijitInline");
		}
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
		this.is_playing=true;
		this.sound.play();
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		this.ui.play.setLabel("pause");
		this.ui.play.onClick = dojo.hitch(this, this.pause);
		this.ui.play.startup();
		this.startTicker();
	}
}
this.pause = function() {
	if(this.sound) {
		this.is_playing=false;
		this.sound.pause();
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		this.ui.play.setLabel("play");
		this.ui.play.onClick = dojo.hitch(this, this.play);
		this.stopTicker();
	}
}
this.skip = function(value) {
	if (!this.ignoreOnChange && this.sound) {
		var d = this.sound.getDuration();
		this.sound._startPos = ((value / 100) * (d/1000));
		if(this.is_playing) {
			this.sound.play();
			this.startTicker();
		}
	}
}
this.stop = function() {
	if(this.sound) {
		this.is_playing=false;
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		this.ui.play.setLabel("play");
		this.ui.play.onClick = dojo.hitch(this, this.play);
		this.sound.stop();
		this.stopTicker();
		this.ui.slider.setValue(0);
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
		file = file.split("/");
		this.filename = file.pop();
	}
}
this.startTicker = function() {
	if(!this.__ticker) this.__ticker = setInterval(dojo.hitch(this, "updateTicker"), 1000);
}
this.stopTicker = function() {
	clearInterval(this.__ticker);
	this.__ticker = false;
}
this.updateTicker = function() {
	var p = this.sound.getPosition();
	var d = this.sound.getDuration();
	if(p == d) this.stop();
	this.ignoreOnChange=true;
	this.ui.slider.setValue(Math.floor((p/d)*100));
	this.ignoreOnChange=false;
	var pos = this.formatTime(p);
	var dur = this.formatTime(d);
	this.box.domNode.innerHTML = "&nbsp;" + this.filename + "&nbsp;&nbsp;" + pos + "/" + dur + "&nbsp;";
}
this.formatTime = function(ms) {
	var ts = ms/1000;
	var m = Math.floor((ts/60));
	var s = Math.floor(ts % 60);
	
	if (s == 60) { m++; s = 0; }
	return m+":"+(s < 10 ? "0"+s : s );
}
this.kill = function() {
	if(!this.win.closed) this.win.close();
	if(this.sound) this.sound.destroy();
	this.stopTicker();
	api.instances.setKilled(this.instance);
}
